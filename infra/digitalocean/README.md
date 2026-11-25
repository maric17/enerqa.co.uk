# DigitalOcean operations

The application runs as `enerqa.service` behind Nginx. Its private environment
file is `/etc/enerqa/production.env`; its uploaded files are in
`/mnt/volume_fra1_1795093297184/enerqa-media`. PostgreSQL listens only on the
server's loopback addresses. Keep `PAYLOAD_SCHEMA_PUSH=false`: do not run old
Payload migrations against the restored database without reviewing the handoff.

The 19 UTC schedules in `enerqa-jobs.cron` call the local application with a
secret stored in `/etc/enerqa/cron.secret`. The forms-maintenance entry skips
until `FORMS_RETENTION_ENABLED=true` is explicitly configured after the review
in `docs/HANDOFF-TASKS.md`. SendPulse is disabled pending setup.

`enerqa-backup.timer` makes a PostgreSQL dump and a media archive on the
Droplet's root disk each day. The attached volume is not included directly in
DigitalOcean's weekly Droplet backups; the root-disk archives are the separate
copy. Keep an additional independently recoverable copy if the business needs
protection beyond the Droplet backup schedule. Backups are not automatically
deleted; check disk use and agree a retention policy before removing any.

`enerqa-health.timer` checks the application, database process, mount, disk
space and certificate expiry every five minutes. Results are in the system
journal under `enerqa-health`. This is local monitoring: it does not send an
off-server alert. The certificate renews using the HTTP webroot and reloads
Nginx after renewal.

The Vercel production deployment is paused. Before any rollback to it, stop the
Droplet scheduler and account for enquiries, media and other data written since
the cutover; simply resuming Vercel would use the older source database.

## GitHub Actions deployments

`.github/workflows/digitalocean.yml` tests pull requests and pushes, then builds
and deploys only the current `main` commit. The GitHub-hosted runner builds the
application instead of compiling on the 2 GB Droplet. It needs three production
environment secrets in `digitalocean-production`: `ENERQA_BUILD_KEY`, `ENERQA_BUILD_DB_PASSWORD`, and
`ENERQA_DEPLOY_KEY`. Never place their values in the repository or a chat.

The build key can only forward a connection to the local PostgreSQL port; the
build role has read-only access to site-content tables, which can include
unpublished content, and cannot read CMS users or enquiries. The deploy key
can only send a release to the fixed receiver. Protect `main`: a person who can
change its workflow can use the deployment credentials and publish code.

Each release is unpacked into its own directory. The receiver tests it privately
before switching the `current` symlink and restarts the app. If the live health
check fails, it switches back to the previous release. It does not alter the
database schema, the uploaded-media directory, or scheduled jobs. Old releases
are retained; agree a cleanup policy before the disk fills up.

## Seven-day headline pilot

After deploying the pilot route, install the updated `run-job.py` and
`enerqa-jobs.cron` at their existing production paths. Create
`/etc/enerqa/news-pilot.enabled` to start the seven-day observation window, or
remove the marker to end it early. Verify the first run with
`journalctl -t enerqa-job --grep news-pilot`. The pilot uses the same APITube
request ledger as the current feed. Samples stay in the server journal.
