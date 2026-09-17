import 'dotenv/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Strict Safety Boundaries
const PROD_PROJECT_REF = 'nqxthuycvltpuptejjot';
const EXPECTED_STAGING_REF = 'rhscrvrgtcsotakdyswx';
const TEST_DOMAIN = 'staging.test.sunshineclasses.internal';
const TEST_ACCOUNT_TAG = 'TEMP_TEST_ACCOUNT_2026';
const DEFAULT_TEST_PASSWORD = 'TempTest#2026!Sunshine';

export interface TestAccountDefinition {
  role: 'ADMIN' | 'RECEPTIONIST' | 'TEACHER' | 'STUDENT';
  email: string;
  username: string;
  displayName: string;
  phone: string;
}

export const TEST_ROLES: TestAccountDefinition[] = [
  {
    role: 'ADMIN',
    email: `temp.test.admin@${TEST_DOMAIN}`,
    username: 'temp_test_admin',
    displayName: '[TEMP-TEST] Staging Admin',
    phone: '+919999000001'
  },
  {
    role: 'RECEPTIONIST',
    email: `temp.test.receptionist@${TEST_DOMAIN}`,
    username: 'temp_test_receptionist',
    displayName: '[TEMP-TEST] Staging Receptionist',
    phone: '+919999000002'
  },
  {
    role: 'TEACHER',
    email: `temp.test.teacher@${TEST_DOMAIN}`,
    username: 'temp_test_teacher',
    displayName: '[TEMP-TEST] Staging Teacher',
    phone: '+919999000003'
  },
  {
    role: 'STUDENT',
    email: `temp.test.student@${TEST_DOMAIN}`,
    username: 'temp_test_student',
    displayName: '[TEMP-TEST] Staging Student',
    phone: '+919999000004'
  }
];

function getStagingClients(): { adminClient: SupabaseClient; anonClient: SupabaseClient; stagingUrl: string } {
  const stagingUrl = process.env.STAGING_SUPABASE_URL || '';
  const stagingServiceKey = process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY || '';
  const stagingAnonKey = process.env.STAGING_SUPABASE_ANON_KEY || '';

  if (!stagingUrl || !stagingServiceKey || !stagingAnonKey) {
    console.error('❌ FATAL: Missing Staging Supabase environment configuration.');
    console.error('Please ensure STAGING_SUPABASE_URL, STAGING_SUPABASE_SERVICE_ROLE_KEY, and STAGING_SUPABASE_ANON_KEY are set.');
    process.exit(1);
  }

  // Safety Assertion 1: Must NOT point to Production
  if (stagingUrl.includes(PROD_PROJECT_REF) || stagingServiceKey.includes(PROD_PROJECT_REF)) {
    console.error(`🚨 CRITICAL SAFETY INTERLOCK: Targeted URL or key contains PRODUCTION reference (${PROD_PROJECT_REF})!`);
    console.error('Aborting immediately to protect production data.');
    process.exit(1);
  }

  // Safety Assertion 2: Verify Staging target
  if (!stagingUrl.includes(EXPECTED_STAGING_REF)) {
    console.warn(`⚠️ WARNING: Staging URL does not match standard ref (${EXPECTED_STAGING_REF}). Proceeding with verified non-production target.`);
  }

  const adminClient = createClient(stagingUrl, stagingServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const anonClient = createClient(stagingUrl, stagingAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  return { adminClient, anonClient, stagingUrl };
}

/**
 * Checks whether an auth user is designated as a temporary test account.
 */
function isTestUser(user: any): boolean {
  if (!user) return false;
  const email = (user.email || '').toLowerCase();
  const metadata = user.user_metadata || {};
  return (
    email.includes('temp.test.') ||
    email.endsWith(`@${TEST_DOMAIN}`) ||
    metadata.is_temporary_test === true ||
    metadata.test_account_tag === TEST_ACCOUNT_TAG ||
    (user.username && String(user.username).startsWith('temp_test_'))
  );
}

/**
 * Provisions temporary test accounts with full relational profile synchronization.
 */
export async function provisionTestAccounts(customPassword?: string) {
  const { adminClient, anonClient, stagingUrl } = getStagingClients();
  const password = customPassword || DEFAULT_TEST_PASSWORD;

  console.log('\n===============================================================');
  console.log('  SUNSHINE ERP - TEMPORARY STAGING TEST ACCOUNTS PROVISIONING  ');
  console.log('===============================================================');
  console.log(`Target: ${stagingUrl}`);
  console.log(`Isolation Domain: @${TEST_DOMAIN}`);
  console.log(`Account Tag: ${TEST_ACCOUNT_TAG}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  // 1. Fetch existing users to check for pre-existing test accounts
  const { data: userList, error: listErr } = await adminClient.auth.admin.listUsers({ perPage: 100 });
  if (listErr) {
    console.error('Failed to list existing auth users:', listErr.message);
    process.exit(1);
  }

  const existingByEmail = new Map<string, any>();
  for (const u of userList.users) {
    if (u.email) existingByEmail.set(u.email.toLowerCase(), u);
  }

  const results: Array<{
    role: string;
    email: string;
    username: string;
    userId: string;
    authStatus: string;
    profileStatus: string;
    verificationStatus: string;
  }> = [];

  for (const def of TEST_ROLES) {
    const emailKey = def.email.toLowerCase();
    const existing = existingByEmail.get(emailKey);
    let userId = existing?.id;
    let authStatus = 'EXISTS';

    const userMetadata = {
      role: def.role,
      name: def.displayName,
      username: def.username,
      phone: def.phone,
      is_temporary_test: true,
      test_account_tag: TEST_ACCOUNT_TAG,
      environment: 'staging',
      created_at: new Date().toISOString()
    };

    if (userId) {
      // Update existing account password and metadata
      const { error: updateErr } = await adminClient.auth.admin.updateUserById(userId, {
        password,
        user_metadata: userMetadata,
        email_confirm: true
      });
      if (updateErr) {
        console.error(`Failed to update ${def.email}:`, updateErr.message);
        authStatus = `UPDATE_FAILED: ${updateErr.message}`;
      } else {
        authStatus = 'UPDATED';
      }
    } else {
      // Create new test account
      const { data: createData, error: createErr } = await adminClient.auth.admin.createUser({
        email: def.email,
        password,
        email_confirm: true,
        user_metadata: userMetadata
      });

      if (createErr) {
        console.error(`Failed to create ${def.email}:`, createErr.message);
        authStatus = `CREATE_FAILED: ${createErr.message}`;
      } else if (createData?.user) {
        userId = createData.user.id;
        authStatus = 'CREATED';
      }
    }

    if (!userId) {
      results.push({
        role: def.role,
        email: def.email,
        username: def.username,
        userId: 'N/A',
        authStatus,
        profileStatus: 'SKIPPED',
        verificationStatus: 'FAILED'
      });
      continue;
    }

    // 2. Synchronize with public.users
    let profileStatus = 'OK';
    try {
      const { error: userTableErr } = await adminClient.from('users').upsert({
        id: userId,
        username: def.username,
        name: def.displayName,
        email: def.email,
        role: def.role,
        phone: def.phone,
        status: 'ACTIVE',
        must_change_password: false,
        updated_at: new Date().toISOString()
      });
      if (userTableErr) {
        profileStatus = `USERS_TABLE_WARN: ${userTableErr.message}`;
      }
    } catch (e: any) {
      profileStatus = `USERS_EX: ${e.message}`;
    }

    // 3. Role-specific relational mappings
    if (def.role === 'TEACHER') {
      try {
        const teacherId = crypto.randomUUID();
        // Check if teacher record already exists for this user_id
        const { data: existingTeacher } = await adminClient
          .from('teachers')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        const tId = existingTeacher?.id || teacherId;
        await adminClient.from('teachers').upsert({
          id: tId,
          user_id: userId,
          name: def.displayName,
          email: def.email,
          mobile: def.phone,
          specialty: ['Class 10', 'Class 9', 'Mathematics'],
          qualification: 'M.Sc. Mathematics (Testing Profile)',
          status: 'ACTIVE'
        });
        profileStatus += ' + TEACHER_RECORD';
      } catch (tErr: any) {
        profileStatus += ` [TEACHER_WARN: ${tErr.message}]`;
      }
    } else if (def.role === 'STUDENT') {
      try {
        const studentId = crypto.randomUUID();
        const testRollNo = 'SC-TEST-9001';
        const { data: existingStudent } = await adminClient
          .from('students')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        const sId = existingStudent?.id || studentId;
        await adminClient.from('students').upsert({
          id: sId,
          user_id: userId,
          roll_no: testRollNo,
          name: def.displayName,
          class_name: 'Class 10',
          preferred_batch: 'Class 10 - Evening Stars',
          email: def.email,
          mobile: def.phone,
          status: 'ACTIVE',
          monthly_fee: 1200,
          admission_date: new Date().toISOString().split('T')[0]
        });

        // Sample test fee record
        const sampleFeeId = crypto.randomUUID();
        await adminClient.from('fee_statuses').upsert({
          id: sampleFeeId,
          student_id: sId,
          student_name: def.displayName,
          month: 'July 2026',
          total_fee: 1200,
          paid_fee: 0,
          pending_fee: 1200,
          status: 'PENDING',
          due_date: '2026-07-10',
          payment_history: []
        });

        profileStatus += ' + STUDENT_RECORD + FEE_STATUS';
      } catch (sErr: any) {
        profileStatus += ` [STUDENT_WARN: ${sErr.message}]`;
      }
    }

    // 4. Verification Check: Test signInWithPassword via anon client
    let verificationStatus = 'PASS';
    try {
      const { data: authSession, error: signInErr } = await anonClient.auth.signInWithPassword({
        email: def.email,
        password
      });

      if (signInErr || !authSession.session) {
        verificationStatus = `FAIL: ${signInErr?.message || 'No session'}`;
      } else {
        verificationStatus = 'VERIFIED_LOGIN_OK';
      }
    } catch (vErr: any) {
      verificationStatus = `EXCEPTION: ${vErr.message}`;
    }

    results.push({
      role: def.role,
      email: def.email,
      username: def.username,
      userId,
      authStatus,
      profileStatus,
      verificationStatus
    });
  }

  // Display summary table
  console.log('PROVISIONING RESULTS:');
  console.table(
    results.map(r => ({
      Role: r.role,
      Email: r.email,
      Username: r.username,
      'User ID': r.userId.substring(0, 13) + '...',
      'Auth Status': r.authStatus,
      'Relational Profiles': r.profileStatus,
      'Login Test': r.verificationStatus
    }))
  );

  console.log('\n===============================================================');
  console.log('  CREDENTIALS REFERENCE (STAGING TEMPORARY ACCOUNTS ONLY)      ');
  console.log('===============================================================');
  console.log(`Password for all test accounts: ${password}`);
  console.log('---------------------------------------------------------------');
  for (const r of results) {
    console.log(`[${r.role}]`);
    console.log(`  Email:    ${r.email}`);
    console.log(`  Username: ${r.username}`);
    console.log(`  User ID:  ${r.userId}`);
    console.log(`  Status:   ${r.verificationStatus}\n`);
  }
  console.log('To purge all temporary test accounts after testing, run:');
  console.log('  npx tsx scripts/manage-staging-test-accounts.ts purge\n');

  return results;
}

/**
 * Lists all temporary test accounts currently residing in staging.
 */
export async function listTestAccounts() {
  const { adminClient, stagingUrl } = getStagingClients();

  console.log('\n=== STAGING TEMPORARY TEST ACCOUNTS STATUS ===');
  console.log(`Target: ${stagingUrl}\n`);

  const { data: userList, error } = await adminClient.auth.admin.listUsers({ perPage: 100 });
  if (error) {
    console.error('Failed to list users:', error.message);
    return [];
  }

  const testUsers = userList.users.filter(isTestUser);

  if (testUsers.length === 0) {
    console.log('✅ No temporary test accounts currently found in Staging.');
    return [];
  }

  console.log(`Found ${testUsers.length} temporary test account(s):`);
  const displayList = testUsers.map(u => ({
    'User ID': u.id,
    Email: u.email,
    Role: u.user_metadata?.role || 'N/A',
    Name: u.user_metadata?.name || 'N/A',
    Created: u.created_at?.split('T')[0] || 'N/A',
    Tag: u.user_metadata?.test_account_tag || 'IDENTIFIED_BY_DOMAIN'
  }));
  console.table(displayList);

  return testUsers;
}

/**
 * Purges all temporary test accounts from Staging (auth users + database tables).
 */
export async function purgeTestAccounts() {
  const { adminClient, stagingUrl } = getStagingClients();

  console.log('\n===============================================================');
  console.log('  SUNSHINE ERP - PURGE TEMPORARY TEST ACCOUNTS (STAGING)       ');
  console.log('===============================================================');
  console.log(`Target: ${stagingUrl}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const { data: userList, error: listErr } = await adminClient.auth.admin.listUsers({ perPage: 100 });
  if (listErr) {
    console.error('Failed to list auth users for purge:', listErr.message);
    process.exit(1);
  }

  const testUsers = userList.users.filter(isTestUser);

  if (testUsers.length === 0) {
    console.log('✅ Zero temporary test accounts detected. Staging is completely clean.');
    return { purgedCount: 0 };
  }

  console.log(`Identified ${testUsers.length} test account(s) marked for deletion:\n`);
  for (const u of testUsers) {
    console.log(` - ${u.email} (${u.id}) [Role: ${u.user_metadata?.role || 'N/A'}]`);
  }
  console.log('');

  let purgedCount = 0;
  for (const u of testUsers) {
    const uid = u.id;

    // 1. Delete associated fee statuses and student records
    try {
      const { data: students } = await adminClient.from('students').select('id').eq('user_id', uid);
      if (students && students.length > 0) {
        const studentIds = students.map(s => s.id);
        await adminClient.from('fee_statuses').delete().in('student_id', studentIds);
        await adminClient.from('students').delete().in('id', studentIds);
      }
    } catch (e: any) {
      console.warn(`[cleanup student records] notice for ${uid}: ${e.message}`);
    }

    // 2. Delete associated teacher records
    try {
      await adminClient.from('teachers').delete().eq('user_id', uid);
    } catch (e: any) {
      console.warn(`[cleanup teacher records] notice for ${uid}: ${e.message}`);
    }

    // 3. Delete from public.users
    try {
      await adminClient.from('users').delete().eq('id', uid);
    } catch (e: any) {
      console.warn(`[cleanup users row] notice for ${uid}: ${e.message}`);
    }

    // 4. Delete from auth.users via Supabase Auth Admin
    const { error: deleteErr } = await adminClient.auth.admin.deleteUser(uid);
    if (deleteErr) {
      console.error(`❌ Failed to delete auth user ${u.email} (${uid}): ${deleteErr.message}`);
    } else {
      console.log(`✅ Successfully deleted auth account & records for: ${u.email}`);
      purgedCount++;
    }
  }

  // Also sweep any orphaned rows in public.users matching test criteria
  try {
    const { error: sweepErr } = await adminClient
      .from('users')
      .delete()
      .or(`email.ilike.%${TEST_DOMAIN},username.ilike.temp_test_%`);
    if (!sweepErr) {
      console.log('✅ Cleaned any residual public.users test entries.');
    }
  } catch (e: any) {
    console.warn(`[sweep residual users] notice: ${e.message}`);
  }

  console.log(`\n🎉 Purge complete. Successfully removed ${purgedCount} of ${testUsers.length} test account(s).`);
  return { purgedCount };
}

/**
 * Verifies live credentials against staging.
 */
export async function verifyTestAccounts(customPassword?: string) {
  const { anonClient, stagingUrl } = getStagingClients();
  const password = customPassword || DEFAULT_TEST_PASSWORD;

  console.log('\n=== VERIFYING STAGING TEST ACCOUNTS LOGIN ===');
  console.log(`Target: ${stagingUrl}\n`);

  const report = [];
  for (const def of TEST_ROLES) {
    try {
      const { data, error } = await anonClient.auth.signInWithPassword({
        email: def.email,
        password
      });

      if (error || !data.session) {
        report.push({
          Role: def.role,
          Email: def.email,
          Status: 'FAIL',
          Details: error?.message || 'No session returned'
        });
      } else {
        report.push({
          Role: def.role,
          Email: def.email,
          Status: 'PASS',
          Details: `JWT Token Received (${data.session.access_token.substring(0, 16)}...)`
        });
      }
    } catch (err: any) {
      report.push({
        Role: def.role,
        Email: def.email,
        Status: 'EXCEPTION',
        Details: err.message
      });
    }
  }

  console.table(report);
}

// CLI Command Router
async function main() {
  const command = process.argv[2] || 'provision';
  const customPass = process.argv.find(arg => arg.startsWith('--password='))?.split('=')[1];

  switch (command) {
    case 'provision':
    case 'create':
      await provisionTestAccounts(customPass);
      break;
    case 'purge':
    case 'cleanup':
    case 'delete':
      await purgeTestAccounts();
      break;
    case 'status':
    case 'list':
      await listTestAccounts();
      break;
    case 'verify':
    case 'test':
      await verifyTestAccounts(customPass);
      break;
    default:
      console.log('Usage: npx tsx scripts/manage-staging-test-accounts.ts [command] [options]');
      console.log('Commands:');
      console.log('  provision  - Generate and verify temporary test accounts for all roles (default)');
      console.log('  purge      - Completely remove all temporary test accounts from auth and database');
      console.log('  status     - List all temporary test accounts currently present');
      console.log('  verify     - Test login for each test account and verify authentication');
      console.log('Options:');
      console.log('  --password=<pass>  Specify custom temporary test password');
      break;
  }
}

if (process.argv[1]?.includes('manage-staging-test-accounts')) {
  main().catch(err => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  });
}
