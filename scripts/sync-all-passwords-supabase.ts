import 'dotenv/config';
import { serverSupabase } from '../src/server/shared/db';
import { PasswordService } from '../src/server/auth/PasswordService';
import { SEED_USERS } from '../src/data';

const TARGET_PASSWORD = 'Sunshine123';

async function syncAllPasswordsToSupabase() {
  console.log(`\n======================================================`);
  console.log(`STARTING UNIVERSAL PASSWORD SYNC TO SUPABASE: "${TARGET_PASSWORD}"`);
  console.log(`======================================================\n`);

  const passwordHash = await PasswordService.hashPassword(TARGET_PASSWORD);
  let updatedAuthCount = 0;
  let provisionedAuthCount = 0;
  let updatedDbCount = 0;

  // 1. Fetch all users from Supabase Auth directory
  try {
    const { data: userListRes, error: listErr } = await serverSupabase.auth.admin.listUsers({
      perPage: 1000
    });

    if (listErr) {
      console.warn(`[Supabase Auth Admin] Warning listing users: ${listErr.message}`);
    }

    const authUsers = userListRes?.users || [];
    console.log(`[Supabase Auth Admin] Found ${authUsers.length} existing Supabase Auth users.`);

    for (const u of authUsers) {
      try {
        const { error: updateErr } = await serverSupabase.auth.admin.updateUserById(u.id, {
          password: TARGET_PASSWORD
        });
        if (!updateErr) {
          updatedAuthCount++;
          console.log(`  ✓ Updated Supabase Auth user: ${u.email || u.id}`);
        } else {
          console.warn(`  ✗ Failed to update ${u.email || u.id}: ${updateErr.message}`);
        }
      } catch (err: any) {
        console.warn(`  ✗ Exception updating ${u.email || u.id}: ${err.message}`);
      }
    }

    // 2. Ensure all core institute SEED_USERS exist in Supabase Auth with Sunshine123
    for (const seed of SEED_USERS) {
      const alreadyInAuth = authUsers.some(
        u => u.email?.toLowerCase() === seed.email.toLowerCase()
      );
      if (!alreadyInAuth && seed.email) {
        try {
          const { error: createErr } = await serverSupabase.auth.admin.createUser({
            email: seed.email,
            password: TARGET_PASSWORD,
            email_confirm: true,
            user_metadata: {
              name: seed.name,
              username: seed.username,
              role: seed.role,
              phone: seed.phone
            }
          });
          if (!createErr) {
            provisionedAuthCount++;
            console.log(`  + Provisioned missing seed user into Supabase Auth: ${seed.username} (${seed.email})`);
          } else {
            console.warn(`  ! Note creating ${seed.username}: ${createErr.message}`);
          }
        } catch (createEx: any) {
          console.warn(`  ! Exception creating ${seed.username}: ${createEx.message}`);
        }
      }
    }
  } catch (authAdminEx: any) {
    console.warn(`[Supabase Auth Admin] Exception in auth user sync:`, authAdminEx.message);
  }

  // 3. Update public.users database records in PostgreSQL
  try {
    const { data: dbUsers, error: dbErr } = await serverSupabase
      .from('users')
      .select('id, email, username');

    if (!dbErr && dbUsers && dbUsers.length > 0) {
      console.log(`\n[Supabase PostgreSQL] Updating ${dbUsers.length} rows in public.users...`);
      for (const u of dbUsers) {
        try {
          await serverSupabase.from('users').update({
            password_hash: passwordHash,
            must_change_password: false,
            updated_at: new Date().toISOString()
          }).eq('id', u.id);
          updatedDbCount++;
        } catch (rowErr: any) {
          console.warn(`  ! Error updating db row ${u.id}:`, rowErr.message);
        }
      }
      console.log(`  ✓ Updated ${updatedDbCount} records in public.users to Sunshine123`);
    } else {
      console.log(`[Supabase PostgreSQL] No public.users rows or offline: ${dbErr?.message || 'Empty'}`);
    }
  } catch (pgEx: any) {
    console.warn(`[Supabase PostgreSQL] Exception updating public.users:`, pgEx.message);
  }

  console.log(`\n======================================================`);
  console.log(`PASSWORD SYNCHRONIZATION COMPLETE!`);
  console.log(`  • Supabase Auth Passwords Updated: ${updatedAuthCount}`);
  console.log(`  • Missing Seed Users Provisioned:   ${provisionedAuthCount}`);
  console.log(`  • Database Users Table Updated:     ${updatedDbCount}`);
  console.log(`  • Target Password:                  ${TARGET_PASSWORD}`);
  console.log(`======================================================\n`);
}

syncAllPasswordsToSupabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal sync error:', err);
    process.exit(1);
  });
