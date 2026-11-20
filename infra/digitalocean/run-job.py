#!/usr/bin/env python3
"""Call one local scheduled route without exposing its secret in process arguments."""
import json
import pathlib
import re
import sys
import syslog
import urllib.error
import urllib.request

paths = {
    'general': '/api/ingest/news',
    'stocks': '/api/ingest/news/stocks',
    'industries-1': '/api/ingest/news/industries-1',
    'industries-2': '/api/ingest/news/industries-2',
    'industries-3': '/api/ingest/news/industries-3',
    'forms': '/api/maintenance/forms',
}

if len(sys.argv) != 2 or sys.argv[1] not in paths:
    raise SystemExit('Unknown scheduled job.')

job = sys.argv[1]
syslog.openlog('enerqa-job')
try:
    if job == 'forms':
        # Retention can delete old records, so keep it off until reviewed.
        env = pathlib.Path('/etc/enerqa/production.env').read_text()
        if not re.search(r'''(?m)^\s*FORMS_RETENTION_ENABLED\s*=\s*["']?true["']?\s*$''', env):
            syslog.syslog(syslog.LOG_INFO, 'forms: skipped; retention is disabled')
            raise SystemExit(0)
    secret = pathlib.Path('/etc/enerqa/cron.secret').read_text().strip()
    if not secret:
        raise ValueError('Missing scheduler secret')
    request = urllib.request.Request(
        'http://127.0.0.1:3000' + paths[job],
        headers={'Authorization': 'Bearer ' + secret},
    )
    with urllib.request.urlopen(request, timeout=330) as response:
        data = json.load(response)
    if data.get('sourcesFailed'):
        raise ValueError('A news provider failed')
    result = 'skipped' if data.get('skipped') else 'succeeded'
    syslog.syslog(syslog.LOG_INFO, f'{job}: {result}; stored={data.get("storedItems", "n/a")}')
except (OSError, ValueError, json.JSONDecodeError, urllib.error.URLError) as error:
    # Log the error class only: response bodies can contain private details.
    syslog.syslog(syslog.LOG_ERR, f'{job}: failed ({type(error).__name__})')
    raise SystemExit(1)
