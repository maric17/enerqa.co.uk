import io
import json
import os
from pathlib import Path
import tarfile
import tempfile
import unittest
from unittest import mock

import importlib.util

spec = importlib.util.spec_from_file_location('receiver', Path(__file__).with_name('receive-release.py'))
receiver = importlib.util.module_from_spec(spec)
spec.loader.exec_module(receiver)


def archive(traversal=False):
    content = {
        'release.json': json.dumps({'commit': 'a' * 40}).encode(),
        '.next/BUILD_ID': b'test',
        'node_modules/next/dist/bin/next': b'test',
        'package.json': b'{}',
    }
    if traversal:
        content['../escape'] = b'bad'
    stream = io.BytesIO()
    with tarfile.open(fileobj=stream, mode='w:gz') as tar:
        for name, data in content.items():
            item = tarfile.TarInfo(name)
            item.size = len(data)
            tar.addfile(item, io.BytesIO(data))
    stream.seek(0)
    return stream


class ReleaseTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        root = Path(self.directory.name)
        releases = root / 'releases'
        releases.mkdir()
        self.old = releases / 'old'
        self.old.mkdir()
        current = root / 'current'
        current.symlink_to(self.old)
        self.patches = [mock.patch.object(receiver, 'ROOT', root),
                        mock.patch.object(receiver, 'RELEASES', releases),
                        mock.patch.object(receiver, 'CURRENT', current),
                        mock.patch.object(receiver.os.path, 'ismount', return_value=True),
                        mock.patch.object(receiver, 'run'),
                        mock.patch.dict(os.environ, {'SSH_ORIGINAL_COMMAND': ''})]
        for patch in self.patches:
            patch.start()
            self.addCleanup(patch.stop)
        self.current = current

    def call(self, data, health):
        fake_stdin = mock.Mock(buffer=data)
        with mock.patch.object(receiver.sys, 'stdin', fake_stdin), \
             mock.patch.object(receiver, 'wait_for_health', side_effect=health):
            receiver.receive()

    def test_switches_after_both_health_checks(self):
        self.call(archive(), [True, True])
        self.assertNotEqual(self.current.resolve(), self.old)

    def test_restores_previous_release_if_new_one_fails(self):
        with self.assertRaisesRegex(RuntimeError, 'production health'):
            self.call(archive(), [True, False, True])
        self.assertEqual(self.current.resolve(), self.old)

    def test_does_not_switch_if_private_health_check_fails(self):
        with self.assertRaisesRegex(RuntimeError, 'private health'):
            self.call(archive(), [False])
        self.assertEqual(self.current.resolve(), self.old)

    def test_rejects_archive_path_traversal(self):
        with self.assertRaises(tarfile.TarError):
            self.call(archive(traversal=True), [])
        self.assertFalse((Path(self.directory.name) / 'escape').exists())
        self.assertEqual(self.current.resolve(), self.old)


if __name__ == '__main__':
    unittest.main()
