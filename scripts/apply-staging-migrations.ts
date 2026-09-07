import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

const PROD_PROJECT_REF = 'nqxthuycvltpuptejjot';

async function main() {
  console.log('=== STAGING DATABASE MIGRATION RUNNER ===');
  
  const appEnv = process.env.APP_ENV;
  const dbUrl = process.env.STAGING_DATABASE_URL;

  console.log('Target Environment APP_ENV:', appEnv || '(not set)');

  if (appEnv !== 'staging') {
    console.error('ERROR: Migration runner must be executed with APP_ENV=staging.');
    process.exit(1);
  }

  if (!dbUrl) {
    console.error('ERROR: STAGING_DATABASE_URL is not set.');
    console.error('Please configure STAGING_DATABASE_URL="postgresql://postgres:[password]@db.[staging-ref].supabase.co:5432/postgres".');
    process.exit(1);
  }

  if (dbUrl.includes(PROD_PROJECT_REF)) {
    console.error('CRITICAL SAFETY VIOLATION: STAGING_DATABASE_URL points to PRODUCTION project ref (' + PROD_PROJECT_REF + '). Aborting immediately!');
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Staging PostgreSQL database...');
    await client.connect();
    console.log('Successfully connected to Staging database.');

    const migrationFiles = [
      'supabase/migrations/20260820_rls_and_tables.sql',
      'supabase/migrations/20260824_harden_rls_and_security.sql'
    ];

    for (const relPath of migrationFiles) {
      const fullPath = path.resolve(process.cwd(), relPath);
      console.log(`\nApplying migration: ${relPath}...`);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Migration file not found: ${fullPath}`);
      }
      const sql = fs.readFileSync(fullPath, 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`Successfully applied: ${relPath}`);
      } catch (sqlErr) {
        await client.query('ROLLBACK');
        console.error(`Failed to apply ${relPath}:`, sqlErr);
        throw sqlErr;
      }
    }

    console.log('\n=== ALL MIGRATIONS APPLIED SUCCESSFULLY TO STAGING ===');
  } catch (err: any) {
    console.error('\nMigration runner failed:', err.message || err);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

main();
