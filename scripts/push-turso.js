const { createClient } = require('@libsql/client');
const { execSync } = require('child_process');

async function main() {
  const url = process.env.DATABASE_URL || 'libsql://aniket-aniketlohar394-commits.aws-ap-south-1.turso.io';
  const authToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODgwODk2OTcsImlkIjoiMDFhMDRjMjYtNjYwMS03ZjlmLWIxM2ItNzI1ZTVmM2NhZjBiIiwia2lkIjoiM1FLNTlmLUJoS3g5clFYRWdHelJtTUFiQVpiUHJoYTRUUjVPTmRXWlMwQSIsInJpZCI6IjUxOGQyMzVmLTZiNTMtNDFlMC05YWM0LTNmYzUxMjA0OGE5MSJ9.WzFNQhmnHLTAyIASd4FBeZ2n-JcGActRzhrsfao5lN731jgIoitJuYZPY1j9RQpoCk2ilqIdniTLmgwyxKoAAg';

  console.log('Connecting to Turso:', url);
  const client = createClient({ url, authToken });

  console.log('Generating Prisma SQL schema...');
  const sql = execSync('npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script', {
    encoding: 'utf-8',
    env: { ...process.env, DATABASE_URL: 'file:./dev.db' }
  });

  console.log('Executing SQL statements on Turso database...');
  // Split statements by semicolon
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const stmt of statements) {
    try {
      await client.execute(stmt);
    } catch (e) {
      if (!e.message.includes('already exists')) {
        console.warn('Warning on statement:', e.message);
      }
    }
  }

  console.log('✅ Successfully created all tables in Turso database!');

  // Verify tables
  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table';");
  console.log('Existing tables in Turso:', tables.rows.map(r => r.name));
}

main().catch(err => {
  console.error('Error syncing to Turso:', err);
  process.exit(1);
});
