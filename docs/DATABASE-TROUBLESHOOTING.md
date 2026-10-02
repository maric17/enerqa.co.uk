# Database connection refusal — 3 October 2026

## Current blocker

The local `DATABASE_URI` points to Supabase's shared pooler at `aws-0-ap-southeast-2.pooler.supabase.com:6543`. TCP connections to both port `6543` and port `5432` returned `ECONNREFUSED` from this workspace. A direct Postgres client also received the refusal on both ports. The connection fails before password authentication; this does not establish whether the saved password is correct.

Payload needs this connection to load CMS content. The news connectors use the same database for shared request budgets and stored access evidence, so their `shared request accounting unavailable` messages follow from the database outage. Changing only the port did not restore access. Project status, connection settings and network rules still need checking in Supabase; their state could not be confirmed locally.

**To do:**

1. Stop the development server while investigating repeated failures.
2. Open the correct Supabase project and confirm it is running. Restore it if paused.
3. Open **Connect** and compare the pooler host, username, database and port with the local `DATABASE_URI`. Copy the current connection details if they differ. Keep passwords in ignored environment files, not screenshots or chat.
4. Check database IP bans and network restrictions. Supabase documents temporary IP bans as one possible cause of connection refusal. If the project and endpoint are correct, check the local VPN/firewall or try another network.
5. Run `npm run db:check` until the configured TCP connection, Postgres authentication/query and all three connector-table checks pass.
6. Restart development with `PAYLOAD_SCHEMA_PUSH=false npm run dev` and open `/`. This disables automatic schema writes against the database shared with production.

Supabase guidance: [connection options](https://supabase.com/docs/guides/database/connecting-to-postgres), [connection refusal and IP bans](https://supabase.com/docs/guides/troubleshooting/error-connection-refused-when-trying-to-connect-to-supabase-database-hwG0Dr).

## Local changes

- Added `npm run db:check`. It loads environment files in the same order as `next dev`, compares the configured pooler ports, then authenticates on the configured endpoint and reads connector-table metadata. It never initializes Payload, changes the database or prints credentials. A failure exits with a nonzero code.
- The provider pool now handles idle connection errors without exposing private connection details or throwing an unhandled pool error.
- Failed access-evidence reads return an explicit unknown verdict rather than passing native Postgres `AggregateError` objects into rendering. Failed writes raise a plain error which the existing access-check handler turns into an unknown verdict. Unconfirmed items remain unpublished; shared provider budgets remain required.
- Payload connection attempts now have a five-second limit. This bounds waiting; it does not repair an unreachable database.

## Verification

- Database check reproduced `ECONNREFUSED` on both pooler ports and exited with code 1, without printing credentials.
- Targeted storage/access-check/provider-fetch tests, TypeScript and ESLint passed. Tests include refused database connections, failed evidence persistence and idle connection errors.
- No database mutation or deployment was performed. Full CMS page rendering remains blocked by the unreachable database; the local error handling is not evidence of restored connectivity.

Uncertain access results are remembered in the current process for up to 30 minutes. Restart the development server after restoring the connection to clear those results.
