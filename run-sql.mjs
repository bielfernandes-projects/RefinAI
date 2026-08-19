import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  host: '2600:1f1e:c3:2701:ac4:aced:a190:9e1a',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Gf100803',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await pool.query("alter table public.user_settings add column if not exists custom_api_keys jsonb default '{}'::jsonb;");
    console.log('OK - column added');
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();