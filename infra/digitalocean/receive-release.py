#!/usr/bin/env python3
"""Receive one prebuilt release and roll back if it cannot start cleanly."""
import fcntl
import json
import os
from pathlib import Path
import re
import socket
import subprocess
import sys
import tarfile
import tempfile
import time
import urllib.error
import urllib.request

ROOT = Path('/opt/enerqa')
RELEASES = ROOT / 'releases'
CURRENT = ROOT / 'current'
NODE = '/opt/enerqa/node/bin/node'
UNIT = 'enerqa-deploy-preflight'
MAX_ARCHIVE = 2 * 1024 * 1024 * 1024
MAX_EXPANDED = 4 * 1024 * 1024 * 1024


def run(*args, check=True):
    return subprocess.run(args, check=check, stdout=subprocess.DEVNULL)


def healthy(port):
    try:
        for path in ('/', '/contact', '/admin'):
            with urllib.request.urlopen(f'http://127.0.0.1:{port}{path}', timeout=5) as response:
                if response.status != 200:
                    return False
        return True
    except (OSError, urllib.error.URLError):
        return False


def wait_for_health(port, seconds=90):
    for _ in range(seconds):
        if healthy(port):
            return True
        time.sleep(1)
    return False


def switch_to(target):
    temporary = ROOT / f'.current-{os.getpid()}'
    os.symlink(str(target), temporary)
    os.replace(temporary, CURRENT)


def receive():
    if os.environ.get('SSH_ORIGINAL_COMMAND'):
        raise ValueError('Remote commands are not accepted.')
    if not os.path.ismount('/mnt/volume_fra1_1795093297184'):
        raise RuntimeError('Media volume is not mounted.')
    if not CURRENT.is_symlink():
        raise RuntimeError('Current release is not a symlink.')
    old = CURRENT.resolve(strict=True)
    if old.parent != RELEASES.resolve():
        raise RuntimeError('Current release is outside the release directory.')

    RELEASES.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='incoming-', dir=RELEASES) as incoming:
        archive = Path(incoming) / 'release.tar.gz'
        size = 0
        with archive.open('xb') as output:
            while chunk := sys.stdin.buffer.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_ARCHIVE:
                    raise ValueError('Release archive is too large.')
                output.write(chunk)
        unpacked = Path(incoming) / 'unpacked'
        unpacked.mkdir()
        with tarfile.open(archive, 'r:gz') as source:
            members = source.getmembers()
            if sum(member.size for member in members) > MAX_EXPANDED:
                raise ValueError('Expanded release is too large.')
            source.extractall(unpacked, members=members, filter='data')
        metadata = json.loads((unpacked / 'release.json').read_text())
        commit = metadata.get('commit', '')
        if not re.fullmatch(r'[0-9a-f]{40}', commit):
            raise ValueError('Invalid release commit.')
        for path in ('.next/BUILD_ID', 'node_modules/next/dist/bin/next', 'package.json'):
            if not (unpacked / path).is_file():
                raise ValueError(f'Release is missing {path}.')
        target = RELEASES / f'ci-{commit[:12]}-{int(time.time())}'
        if target.exists():
            raise RuntimeError('Release already exists.')
        os.rename(unpacked, target)
        run('chown', '-R', 'enerqa:enerqa', str(target))

    switched = False
    unit = f'{UNIT}-{os.getpid()}'
    try:
        with socket.socket() as probe:
            if probe.connect_ex(('127.0.0.1', 3101)) == 0:
                raise RuntimeError('The private preflight port is already in use.')
        run('systemd-run', f'--unit={unit}', '--property=User=enerqa',
            '--property=Group=enerqa', f'--property=WorkingDirectory={target}',
            '--property=EnvironmentFile=/etc/enerqa/production.env',
            '--property=NoNewPrivileges=yes', '--property=PrivateTmp=yes',
            '--property=Environment=PATH=/opt/enerqa/node/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
            '--property=Environment=NODE_OPTIONS=--max-old-space-size=512',
            NODE, str(target / 'node_modules/next/dist/bin/next'), 'start',
            '--hostname', '127.0.0.1', '--port', '3101')
        if not wait_for_health(3101):
            raise RuntimeError('New release failed the private health check.')
        run('systemctl', 'stop', unit + '.service')
        switch_to(target)
        switched = True
        run('systemctl', 'restart', 'enerqa.service')
        if not wait_for_health(3000):
            raise RuntimeError('New release failed the production health check.')
        print(f'Deployed commit {commit} successfully.', flush=True)
    except Exception:
        if switched:
            switch_to(old)
            run('systemctl', 'restart', 'enerqa.service', check=False)
            if not wait_for_health(3000):
                print('Rollback also failed its health check; investigate immediately.', file=sys.stderr)
        raise
    finally:
        run('systemctl', 'stop', unit + '.service', check=False)
        run('systemctl', 'reset-failed', unit + '.service', check=False)


def main():
    with open('/run/lock/enerqa-deploy.lock', 'w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        receive()


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError, RuntimeError, subprocess.CalledProcessError, tarfile.TarError) as exc:
        print(f'Deployment failed: {exc}', file=sys.stderr)
        sys.exit(1)
