import nextEnv from '@next/env';
import net from 'node:net';
import pg from 'pg';

// Match next dev's environment precedence without printing any secret values.
nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });

function reachable(host, port) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host, port });
    const finish = result => { socket.destroy(); resolve(result); };
    socket.setTimeout(5000);
    socket.once('connect', () => finish('reachable'));
    socket.once('timeout', () => finish('timeout'));
    socket.once('error', error => finish(error.code ?? 'connection failed'));
  });
}

let client;
try {
  if (!process.env.DATABASE_URI) throw new Error('DATABASE_URI is not configured.');
  const uri = new URL(process.env.DATABASE_URI);
  if (!['postgres:', 'postgresql:'].includes(uri.protocol)) throw new Error('Invalid database protocol.');
  const port = Number(uri.port || 5432);
  console.log(`Database endpoint: ${uri.hostname}:${port}`);

  // Compare Supabase's two pooler ports before testing credentials on the configured endpoint only.
  const ports = uri.hostname.endsWith('.pooler.supabase.com') ? [...new Set([port, 5432, 6543])] : [port];
  const results = await Promise.all(ports.map(async candidate => ({ port: candidate, result: await reachable(uri.hostname, candidate) })));
  for (const result of results) console.log(`TCP ${result.port}: ${result.result}`);
  if (results.find(result => result.port === port)?.result !== 'reachable') {
    console.error('The configured endpoint is unreachable before password authentication.');
    console.error('Check Supabase project status, Connect settings, IP bans/restrictions, and VPN/firewall settings.');
    process.exitCode = 1;
  } else {
    client = new pg.Client({ connectionString: process.env.DATABASE_URI, connectionTimeoutMillis: 5000, query_timeout: 5000 });
    client.on('error', () => console.error('The database connection was lost.'));
    await client.connect();
    // Read metadata only. This script never initializes Payload or changes its schema.
    const { rows: [tables] } = await client.query(`SELECT
      to_regclass('enerqa_connectors.provider_requests') IS NOT NULL AS provider_requests,
      to_regclass('enerqa_connectors.access_checks') IS NOT NULL AS access_checks,
      to_regclass('enerqa_connectors.external_records') IS NOT NULL AS external_records`);
    console.log('Postgres authentication and read-only query: passed');
    for (const [table, exists] of Object.entries(tables)) console.log(`Connector table ${table}: ${exists ? 'present' : 'missing'}`);
    if (Object.values(tables).some(exists => !exists)) process.exitCode = 1;
  }
} catch (error) {
  // Driver error messages can include credentials or URLs; show only a safe code.
  console.error(`Database check failed (${error.code ?? 'configuration or connection error'}).`);
  process.exitCode = 1;
} finally {
  await client?.end().catch(() => {});
}
