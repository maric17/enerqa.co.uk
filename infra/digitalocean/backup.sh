#!/usr/bin/env bash
set -euo pipefail
umask 077

# Keep the volume copy on the Droplet disk so its backup can include both.
media=${ENERQA_MEDIA_DIR:-/mnt/volume_fra1_1795093297184/enerqa-media}
root=${ENERQA_BACKUP_DIR:-/var/backups/enerqa/daily}
database=${ENERQA_BACKUP_DATABASE:-enerqa_production}
mountpoint -q /mnt/volume_fra1_1795093297184
test -d "$media"
install -d -m 700 "$root"
exec 9>"$root/.lock"
flock -n 9 || { echo 'Backup already running.' >&2; exit 1; }

# Refuse to fill the server disk. Allow the uncompressed media and database
# sizes plus 2 GiB for the operating system; never delete older backups here.
media_bytes=$(du -sb "$media" | cut -f1)
database_bytes=$(runuser -u postgres -- psql -At -v ON_ERROR_STOP=1 -d "$database" -c 'SELECT pg_database_size(current_database())')
available_bytes=$(df -B1 --output=avail "$root" | tail -n 1 | tr -d ' ')
required_bytes=$((media_bytes + database_bytes + 2147483648))
if (( available_bytes < required_bytes )); then
  echo 'Backup stopped: insufficient free space on the backup disk.' >&2
  exit 1
fi

destination="$root/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -m 700 "$destination"
runuser -u postgres -- pg_dump --format=custom --no-owner --no-acl "$database" > "$destination/database.dump"
pg_restore --list "$destination/database.dump" >/dev/null
tar -C "$media" -czf "$destination/media.tar.gz" .
tar -tzf "$destination/media.tar.gz" >/dev/null
(
  cd "$destination"
  sha256sum database.dump media.tar.gz > SHA256SUMS
  sha256sum -c SHA256SUMS
)
echo "Backup verified: $destination"
