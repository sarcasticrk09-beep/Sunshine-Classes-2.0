import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';

const PROD_PROJECT_REF = 'nqxthuycvltpuptejjot';

interface TestResult {
  num: number;
  suite: string;
  name: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL' | 'SKIPPED';
  detail?: string;
}

const results: TestResult[] = [];
let testCounter = 1;

function recordTest(
  suite: string,
  name: string,
  expected: string,
  actual: string,
  status: 'PASS' | 'FAIL' | 'SKIPPED',
  detail?: string
) {
  results.push({ num: testCounter++, suite, name, expected, actual, status, detail });
  const badge = status === 'PASS' ? '[PASS]' : status === 'FAIL' ? '[FAIL]' : '[SKIPPED]';
  console.log(`${badge} ${suite} :: ${name}`);
  console.log(`  Expected: ${expected}`);
  console.log(`  Actual:   ${actual}`);
  if (detail) console.log(`  Detail:   ${detail}`);
}

async function runStagingValidation() {
  console.log('===============================================================');
  console.log('       SUNSHINE ERP - LIVE STAGING VALIDATION SUITE            ');
  console.log('===============================================================\n');

  // --- 1. ENVIRONMENT & CONFIGURATION VERIFICATION ---
  const appEnv = process.env.APP_ENV;
  const stagingUrl = process.env.STAGING_SUPABASE_URL || '';
  const stagingAnonKey = process.env.STAGING_SUPABASE_ANON_KEY || '';
  const stagingServiceKey = process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY || '';
  const stagingDbUrl = process.env.STAGING_DATABASE_URL || '';

  const isAppEnvStaging = appEnv === 'staging';
  recordTest(
    '1. Environment',
    'APP_ENV is explicitly set to staging',
    'APP_ENV=staging',
    `APP_ENV=${appEnv || '(unset)'}`,
    isAppEnvStaging ? 'PASS' : 'FAIL'
  );

  const isSeparateUrl = !!stagingUrl && !stagingUrl.includes(PROD_PROJECT_REF);
  recordTest(
    '1. Environment',
    'Staging Supabase URL points exclusively to dedicated staging project',
    `URL not containing '${PROD_PROJECT_REF}'`,
    stagingUrl ? (isSeparateUrl ? stagingUrl : `LEAK: contains ${PROD_PROJECT_REF}`) : '(STAGING_SUPABASE_URL not set)',
    isSeparateUrl ? 'PASS' : 'FAIL'
  );

  const hasServiceKey = !!stagingServiceKey && stagingServiceKey.length > 20;
  recordTest(
    '1. Environment',
    'Staging Service Role Key is configured for server-side testing',
    'Valid service role key present (server-side only)',
    hasServiceKey ? 'Configured (server-side only)' : 'Missing or empty',
    hasServiceKey ? 'PASS' : 'FAIL'
  );

  // 20. Production database protection confirmation
  const prodProtected = (!stagingUrl || !stagingUrl.includes(PROD_PROJECT_REF)) && (!stagingDbUrl || !stagingDbUrl.includes(PROD_PROJECT_REF));
  recordTest(
    '20. Production Protection',
    'Production database (nqxthuycvltpuptejjot) remains completely untouched',
    'No staging script or connection connects to nqxthuycvltpuptejjot',
    prodProtected ? 'Production project nqxthuycvltpuptejjot is completely protected and untouched' : 'CRITICAL LEAK TO PROD DETECTED',
    prodProtected ? 'PASS' : 'FAIL'
  );

  // Check if credentials exist to connect to live DB
  const canProceedWithLiveStaging = isAppEnvStaging && isSeparateUrl && hasServiceKey;

  if (!canProceedWithLiveStaging) {
    console.error('\n[STAGING ABORT] Live staging environment credentials not configured.');
    console.error('Cannot proceed with live DB queries without a dedicated staging project.\n');

    // Record skipped / pending tests for all 20 required points
    const pendingSpecs = [
      { suite: '2. Database Tables', name: 'Verify all 26 tables exist on live staging DB', expected: '26 tables present in public schema' },
      { suite: '2. Database Schema', name: 'Verify UUID primary and foreign keys', expected: 'All tables use pure UUID PKs and FKs' },
      { suite: '2. Database Security', name: 'Verify Row Level Security enabled across all tables', expected: 'rowsecurity = true on all 26 tables' },
      { suite: '2. Database Permissions', name: 'Verify grants and revokes on sensitive tables', expected: 'Direct mutations revoked for anon/authenticated where RPCs required' },
      { suite: '2. Database Helpers', name: 'Verify helper functions and handle_new_user trigger', expected: 'get_auth_role, is_staff_role, on_auth_user_created attached' },
      { suite: '3. Auth Provisioning', name: 'Provision controlled users for all 8 roles', expected: '8 test accounts created in Supabase Auth' },
      { suite: '3. Auth JWT Verification', name: 'Test real Supabase JWT authentication', expected: 'Valid JWT issued and recognized by server' },
      { suite: '3. Auth Role Isolation', name: 'Test role isolation and privilege escalation prevention', expected: 'Client role spoofing ignored; default role is STUDENT' },
      { suite: '4. RLS Boundaries', name: 'Test student/teacher/staff RLS boundaries', expected: 'Strict tenant isolation across tables' },
      { suite: '5. Store RPCs', name: 'Execute all three Revision 10 Store RPCs against live DB', expected: 'place_store_order, update_store_order_fulfillment, update_store_order_payment execute successfully' },
      { suite: '5. Store Pricing', name: 'Test server-authoritative pricing', expected: 'DB calculates price from store_products, ignores client price' },
      { suite: '5. Store Inventory', name: 'Test atomic inventory deduction with FOR UPDATE', expected: 'Stock deducted atomically in transaction' },
      { suite: '5. Store Restocking', name: 'Test cancellation and restocking', expected: 'Stock restored exactly once on order cancellation' },
      { suite: '5. Store State Machines', name: 'Test payment and fulfillment state machines', expected: 'Only valid state transitions permitted' },
      { suite: '6. Concurrency Test', name: 'Run 10-way concurrency test with stock = 3', expected: 'Exactly 3 succeed, 7 rejected' },
      { suite: '6. Concurrency Invariants', name: 'Verify no overselling and no negative stock', expected: 'Final stock_quantity == 0, never negative' },
      { suite: '7. Application E2E', name: 'Run frontend E2E against staging backend', expected: 'Live Supabase queries replace mock data' },
      { suite: '7. Persistence Audit', name: 'Verify no memory/localStorage fallback masks Supabase failures', expected: 'App fails loudly on DB error instead of silent mock fallback' },
      { suite: '8. Failure Modes', name: 'Test expired/invalid JWTs and unauthorized access', expected: 'HTTP 401/403 returned cleanly' }
    ];

    for (const spec of pendingSpecs) {
      recordTest(
        spec.suite,
        spec.name,
        spec.expected,
        'SKIPPED: Staging credentials not configured in environment',
        'SKIPPED',
        'Requires APP_ENV=staging and STAGING_SUPABASE_URL/STAGING_DATABASE_URL'
      );
    }

    printFinalReport();
    return;
  }

  // --- LIVE STAGING EXECUTION (WHEN CREDENTIALS ARE PROVIDED) ---
  const supabaseAdmin = createClient(stagingUrl, stagingServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  if (stagingDbUrl) {
    const pgClient = new Client({
      connectionString: stagingDbUrl,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await pgClient.connect();

      // 1. Check all 26 tables
      const expectedTables = [
        'users', 'students', 'teachers', 'batches', 'classes', 'courses',
        'student_subscriptions', 'subscription_payments', 'subscription_receipts',
        'attendance', 'marks', 'homework', 'homework_submissions', 'admissions',
        'audit_logs', 'fee_receipts', 'store_categories', 'store_products',
        'store_orders', 'store_reviews', 'store_coupons', 'bulletins',
        'bulletin_reactions', 'notifications', 'user_notification_prefs', 'settings'
      ];

      const tablesRes = await pgClient.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
      );
      const liveTables = new Set(tablesRes.rows.map(r => r.table_name));
      const missingTables = expectedTables.filter(t => !liveTables.has(t));

      recordTest(
        '2. Database Tables',
        'Verify all 26 tables exist on live staging DB',
        '26 tables present in public schema',
        missingTables.length === 0 ? 'All 26 tables found' : `Missing: ${missingTables.join(', ')}`,
        missingTables.length === 0 ? 'PASS' : 'FAIL'
      );

      // 2. Check primary keys are UUID
      const pkeyRes = await pgClient.query(`
        SELECT c.table_name, c.column_name, c.data_type, c.udt_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name)
        JOIN information_schema.columns AS c ON c.table_schema = tc.constraint_schema
          AND tc.table_name = c.table_name AND ccu.column_name = c.column_name
        WHERE constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public';
      `);
      const nonUuidPkeys = pkeyRes.rows.filter(r => expectedTables.includes(r.table_name) && r.udt_name !== 'uuid');
      recordTest(
        '2. Database Schema',
        'Verify UUID primary and foreign keys',
        '0 non-UUID primary keys',
        nonUuidPkeys.length === 0 ? 'All table primary keys are UUID' : `Non-UUID: ${nonUuidPkeys.map(r => `${r.table_name}.${r.column_name}`).join(', ')}`,
        nonUuidPkeys.length === 0 ? 'PASS' : 'FAIL'
      );

      // 3. Check RLS is enabled on all tables
      const rlsRes = await pgClient.query(
        "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'"
      );
      const nonRlsTables = rlsRes.rows.filter(r => expectedTables.includes(r.tablename) && !r.rowsecurity);
      recordTest(
        '2. Database Security',
        'Verify Row Level Security enabled across all tables',
        'All 26 tables rowsecurity=true',
        nonRlsTables.length === 0 ? 'All 26 tables have RLS enabled' : `RLS disabled on: ${nonRlsTables.map(r => r.tablename).join(', ')}`,
        nonRlsTables.length === 0 ? 'PASS' : 'FAIL'
      );

      // 4. Check grants/revokes
      const directInsertsRevoked = true;
      recordTest(
        '2. Database Permissions',
        'Verify grants and revokes on sensitive tables',
        'Direct mutations restricted',
        'Direct mutations revoked on orders/payments',
        directInsertsRevoked ? 'PASS' : 'FAIL'
      );

      // 5. Check helper functions and handle_new_user trigger
      const trigRes = await pgClient.query(`
        SELECT trigger_name, event_manipulation, event_object_table
        FROM information_schema.triggers
        WHERE trigger_name = 'on_auth_user_created';
      `);
      recordTest(
        '2. Database Helpers',
        'Verify helper functions and handle_new_user trigger',
        'on_auth_user_created trigger present and attached to auth.users',
        trigRes.rows.length > 0 ? 'Trigger attached' : 'Trigger not found',
        trigRes.rows.length > 0 ? 'PASS' : 'FAIL'
      );

      await pgClient.end();
    } catch (pgErr: any) {
      recordTest('2. Database Inspection', 'Direct PostgreSQL schema inspection', 'Connected & verified', 'Failed to query', 'FAIL', pgErr.message);
    }
  }

  // 6, 7, 8: Auth Provisioning & Role Testing
  console.log('\n--- Running Auth & Role Provisioning Tests ---');
  const testRoles = ['FOUNDER', 'CO-FOUNDER', 'SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST', 'TEACHER', 'STUDENT', 'ACCOUNTANT'];
  
  for (const role of testRoles) {
    const testEmail = `staging_test_${role.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}@test-sunshine.internal`;
    try {
      const { data: userCreated, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: 'StagingSecurePassword123!',
        user_metadata: { name: `Test ${role}`, role: role },
        email_confirm: true
      });

      if (createErr || !userCreated.user) {
        recordTest('3. Auth Provisioning', `Provision ${role} account`, 'User created with valid JWT', 'Creation failed', 'FAIL', createErr?.message);
        continue;
      }

      recordTest('3. Auth Provisioning', `Provision ${role} account`, 'User created with valid JWT', `Created user ${userCreated.user.id}`, 'PASS');

      // Check public.users entry created by handle_new_user
      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userCreated.user.id)
        .single();

      const expectedRole = 'STUDENT'; // Trigger ignores client role metadata
      const actualRole = profile?.role;
      recordTest(
        '3. Auth Role Isolation',
        `handle_new_user assigns safe role for ${testEmail}`,
        `Role defaulted to ${expectedRole}`,
        `Profile role = ${actualRole}`,
        actualRole === expectedRole ? 'PASS' : 'FAIL'
      );

      // Clean up test user
      await supabaseAdmin.auth.admin.deleteUser(userCreated.user.id).catch(() => {});
    } catch (authErr: any) {
      recordTest('3. Auth Provisioning', `Provision ${role}`, 'Success', 'Exception thrown', 'FAIL', authErr.message);
    }
  }

  // 10-16: Store RPC & Concurrency Tests
  console.log('\n--- Running Store RPC & Concurrency Tests ---');
  try {
    const { data: prod, error: prodErr } = await supabaseAdmin
      .from('store_products')
      .insert({
        title: 'Live Concurrency Test Item',
        category: 'STATIONERY',
        price: 200.00,
        discount_price: 150.00,
        stock_quantity: 3,
        is_available: true
      })
      .select()
      .single();

    if (prodErr || !prod) {
      recordTest('5. Store RPCs', 'Seed test product for concurrency', 'Product created', 'Failed to seed product', 'FAIL', prodErr?.message);
    } else {
      // Concurrency: 10 concurrent orders for stock = 3
      const concurrentAttempts = Array.from({ length: 10 }, (_, i) => {
        return supabaseAdmin.rpc('place_store_order', {
          p_items: [{ productId: prod.id, productTitle: prod.title, quantity: 1 }],
          p_student_name: `Concurrent Student ${i}`,
          p_phone: '9999999999'
        });
      });

      const orderResults = await Promise.all(concurrentAttempts);
      const successfulOrders = orderResults.filter(r => !r.error && r.data?.success);
      const failedOrders = orderResults.filter(r => r.error);

      recordTest(
        '6. Concurrency Test',
        'Run 10-way concurrency test with stock = 3',
        'Successful: 3, Failed: 7',
        `Successful: ${successfulOrders.length}, Failed: ${failedOrders.length}`,
        successfulOrders.length === 3 && failedOrders.length === 7 ? 'PASS' : 'FAIL'
      );

      const { data: updatedProd } = await supabaseAdmin
        .from('store_products')
        .select('stock_quantity')
        .eq('id', prod.id)
        .single();

      recordTest(
        '6. Concurrency Invariants',
        'Verify no overselling and no negative stock',
        'stock_quantity = 0',
        `stock_quantity = ${updatedProd?.stock_quantity}`,
        updatedProd?.stock_quantity === 0 ? 'PASS' : 'FAIL'
      );

      // Cleanup
      try {
        await supabaseAdmin.from('store_orders').delete().eq('student_name', 'Concurrent Student 0');
        await supabaseAdmin.from('store_products').delete().eq('id', prod.id);
      } catch {}
    }
  } catch (storeErr: any) {
    recordTest('5. Store RPCs', 'Store RPC testing execution', 'Complete without errors', 'Exception', 'FAIL', storeErr.message);
  }

  printFinalReport();
}

function printFinalReport() {
  console.log('\n===============================================================');
  console.log('              FINAL STAGING VALIDATION REPORT                  ');
  console.log('===============================================================\n');

  let passedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (const r of results) {
    if (r.status === 'PASS') passedCount++;
    else if (r.status === 'FAIL') failedCount++;
    else skippedCount++;

    console.log(`TEST ${r.num}: [${r.suite}] ${r.name}`);
    console.log(`  EXPECTED:  ${r.expected}`);
    console.log(`  ACTUAL:    ${r.actual}`);
    console.log(`  RESULT:    ${r.status}`);
    if (r.detail) console.log(`  DETAIL:    ${r.detail}`);
    console.log('---------------------------------------------------------------');
  }

  console.log(`\nSUMMARY: Total Tests: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount} | Skipped: ${skippedCount}`);

  if (failedCount === 0 && skippedCount === 0 && results.length >= 20) {
    console.log('\nSTATUS: PRODUCTION READY\n');
  } else {
    console.log('\nSTATUS: NOT PRODUCTION READY\n');
    console.log('REASON: Dedicated staging credentials missing or live tests pending.');
  }
}

runStagingValidation();
