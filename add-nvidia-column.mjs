import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres:Gf100803@db.bccjuxdwpgqhicgohtgi.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await pool.query("alter table public.user_settings add column if not exists nvidia_api_key text;");
    console.log('OK - nvidia_api_key column added');
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();