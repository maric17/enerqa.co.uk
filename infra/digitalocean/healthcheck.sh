#!/usr/bin/env bash
set -euo pipefail

# Write failures to the system journal for the server operator to inspect.
fail() { logger -t enerqa-health -p user.err -- "$1"; exit 1; }
mountpoint -q /mnt/volume_fra1_1795093297184 || fail 'Media volume is not mounted.'
systemctl is-active --quiet postgresql || fail 'PostgreSQL is not running.'
systemctl is-active --quiet enerqa.service || fail 'Application is not running.'
curl -fsS --max-time 20 -o /dev/null http://127.0.0.1:3000/ || fail 'Application homepage is unavailable.'
openssl x509 -checkend 1209600 -noout -in /etc/letsencrypt/live/enerqa.co.uk/cert.pem >/dev/null || fail 'Certificate expires within 14 days.'
for path in / /mnt/volume_fra1_1795093297184; do
  used=$(df -P "$path" | awk 'NR == 2 { gsub(/%/, "", $5); print $5 }')
  (( used < 80 )) || fail "Disk usage is at or above 80 percent: $path"
done
logger -t enerqa-health -p user.info -- 'Health checks passed.'
