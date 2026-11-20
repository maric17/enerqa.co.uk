#!/usr/bin/env bash
set -euo pipefail
umask 077

# Run only after writes and scheduled jobs on the source have been stopped.
export PGSERVICEFILE=/root/.config/enerqa/source.pgservice
backup_dir=/var/backups/enerqa/source
database=enerqa_production
stamp=$(date -u +%Y%m%dT%H%M%SZ)
dump="$backup_dir/final-$stamp.dump"
list_file=$(mktemp /tmp/enerqa-restore-list.XXXXXXXX)
trap 'rm -f "$list_file"' EXIT

if runuser -u postgres -- psql -Atqc "SELECT 1 FROM pg_database WHERE datname='$database'" | grep -q 1; then
  echo 'Production database already exists; refusing to overwrite it.' >&2
  exit 1
fi

pg_dump --format=custom --no-owner --no-acl -n public -n enerqa_connectors service=enerqa_source > "$dump"
pg_restore --list "$dump" > "$backup_dir/final-$stamp.contents"
sha256sum "$dump" > "$backup_dir/final-$stamp.sha256"
sha256sum -c "$backup_dir/final-$stamp.sha256"

# PostgreSQL already creates public in a new database. Exclude only its
# CREATE SCHEMA entry while restoring every other object from the dump.
sed '/SCHEMA - public /s/^/;/' "$backup_dir/final-$stamp.contents" > "$list_file"
chown postgres:postgres "$list_file"
chmod 600 "$list_file"
runuser -u postgres -- createdb -O enerqa "$database"
runuser -u postgres -- pg_restore --exit-on-error --no-owner --no-acl -L "$list_file" -d "$database" < "$dump"
runuser -u postgres -- psql -v ON_ERROR_STOP=1 -d "$database" < /root/.config/enerqa/grant-app.sql
echo "Fresh production database restored from $dump"
