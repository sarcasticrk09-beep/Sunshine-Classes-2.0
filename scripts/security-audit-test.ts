import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../src/server/auth/AuthMiddleware';

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  testId: string;
  name: string;
  expectedStatus: number;
  actualStatus: number;
  passed: boolean;
  notes?: string;
}

const results: TestResult[] = [];

async function recordTest(
  testId: string,
  name: string,
  expectedStatus: number,
  response: Response,
  notes?: string
) {
  const actualStatus = response.status;
  const passed = actualStatus === expectedStatus;
  results.push({
    testId,
    name,
    expectedStatus,
    actualStatus,
    passed,
    notes
  });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] Test ${testId}: ${name} (Expected: ${expectedStatus}, Got: ${actualStatus})`);
}

async function runSecurityAudit() {
  console.log('--- STARTING SECURITY TEST MATRIX (TESTS A-Q) ---');

  // Generate test tokens with JWT_SECRET
  const studentToken = jwt.sign(
    { sub: 'usr-student-test', role: 'STUDENT', username: 'teststudent', email: 'teststudent@sunshine.net' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const teacherToken = jwt.sign(
    { sub: 'usr-teacher-test', role: 'TEACHER', username: 'testteacher', email: 'testteacher@sunshine.net' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const accountantToken = jwt.sign(
    { sub: 'usr-accountant-test', role: 'ACCOUNTANT', username: 'testaccountant', email: 'testaccountant@sunshine.net' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const adminToken = jwt.sign(
    { sub: 'usr-admin-test', role: 'ADMIN', username: 'testadmin', email: 'testadmin@sunshine.net' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const expiredToken = jwt.sign(
    { sub: 'usr-expired-test', role: 'ADMIN', username: 'expiredadmin' },
    JWT_SECRET,
    { expiresIn: -60 } // expired 60 seconds ago
  );

  const forgedToken = jwt.sign(
    { sub: 'usr-attacker', role: 'FOUNDER', username: 'attacker' },
    'wrong-untrusted-secret-key-12345',
    { expiresIn: '1h' }
  );

  // Test A: No auth -> protected API => 401
  const resA = await fetch(`${BASE_URL}/api/students`, {
    headers: { 'Content-Type': 'application/json' }
  });
  await recordTest('A', 'No auth -> protected API => 401', 401, resA);

  // Test B: Invalid JWT -> protected API => 401
  const resB = await fetch(`${BASE_URL}/api/students`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${forgedToken}`
    }
  });
  await recordTest('B', 'Invalid / untrusted JWT signature -> 401', 401, resB);

  // Test C: Expired JWT -> protected API => 401
  const resC = await fetch(`${BASE_URL}/api/students`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${expiredToken}`
    }
  });
  await recordTest('C', 'Expired JWT -> 401', 401, resC);

  // Test D: STUDENT -> admin endpoint => 403
  const resD = await fetch(`${BASE_URL}/api/admin/audit-users`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    }
  });
  await recordTest('D', 'STUDENT -> admin endpoint => 403', 403, resD);

  // Test E: TEACHER -> admin endpoint => 403
  const resE = await fetch(`${BASE_URL}/api/admin/audit-users`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`
    }
  });
  await recordTest('E', 'TEACHER -> admin endpoint => 403', 403, resE);

  // Test F: ACCOUNTANT -> unauthorized admin operation => 403
  const resF = await fetch(`${BASE_URL}/api/admin/audit-users`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accountantToken}`
    }
  });
  await recordTest('F', 'ACCOUNTANT -> unauthorized admin endpoint => 403', 403, resF);

  // Test G: Authorized ADMIN -> permitted operation => 200
  const resG = await fetch(`${BASE_URL}/api/admin/audit-users`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  });
  await recordTest('G', 'Authorized ADMIN -> permitted operation => 200', 200, resG);

  // Test H: Body role = FOUNDER while caller is STUDENT => denied (403)
  const resH = await fetch(`${BASE_URL}/api/admin/delete-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      uid: 'target-user',
      role: 'FOUNDER' // Attacker attempting body role elevation
    })
  });
  await recordTest('H', 'Body role = FOUNDER spoofing by STUDENT => 403 denied', 403, resH);

  // Test I: Body userId = another user => caller identity unchanged
  const resI = await fetch(`${BASE_URL}/api/delete-cloudinary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      publicId: 'test-asset-123',
      userId: 'usr-admin-victim', // Attacker attempting identity spoofing
      role: 'SUPER_ADMIN'
    })
  });
  await recordTest('I', 'Body userId spoofing by STUDENT => 403 denied', 403, resI);

  // Test J: Missing DB/auth dependency => fail closed, never ADMIN (send garbage token)
  const resJ = await fetch(`${BASE_URL}/api/admin/audit-users`, {
    headers: {
      'Authorization': 'Bearer malformed.garbage.token'
    }
  });
  await recordTest('J', 'Missing/malformed auth fails closed => 401', 401, resJ);

  // Test K: /api/admin/create-user without auth => 401
  const resK = await fetch(`${BASE_URL}/api/admin/create-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hacker', password: 'password' })
  });
  await recordTest('K', '/api/admin/create-user without auth => 401', 401, resK);

  // Test L: /api/admin/delete-user without auth => 401
  const resL = await fetch(`${BASE_URL}/api/admin/delete-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid: 'usr-target' })
  });
  await recordTest('L', '/api/admin/delete-user without auth => 401', 401, resL);

  // Test M: /api/admin/audit-users without auth => 401
  const resM = await fetch(`${BASE_URL}/api/admin/audit-users`);
  await recordTest('M', '/api/admin/audit-users without auth => 401', 401, resM);

  // Test N: /api/admin/cloudinary-credentials without auth => 401
  const resN = await fetch(`${BASE_URL}/api/admin/cloudinary-credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: 'new-key' })
  });
  await recordTest('N', '/api/admin/cloudinary-credentials without auth => 401', 401, resN);

  // Test O: /api/delete-cloudinary without auth => 401
  const resO = await fetch(`${BASE_URL}/api/delete-cloudinary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId: 'test-asset' })
  });
  await recordTest('O', '/api/delete-cloudinary without auth => 401', 401, resO);

  // Test P: /api/send-email without auth => 401
  const resP = await fetch(`${BASE_URL}/api/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: 'victim@example.com' })
  });
  await recordTest('P', '/api/send-email without auth => 401', 401, resP);

  // Test Q: /api/send-whatsapp without auth => 401
  const resQ = await fetch(`${BASE_URL}/api/send-whatsapp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: '919999999999', message: 'test' })
  });
  await recordTest('Q', '/api/send-whatsapp without auth => 401', 401, resQ);

  const passedCount = results.filter(r => r.passed).length;
  console.log(`\n--- RESULTS: ${passedCount}/${results.length} PASSED ---`);
  if (passedCount !== results.length) {
    process.exit(1);
  }
}

runSecurityAudit().catch(err => {
  console.error('Audit run error:', err);
  process.exit(1);
});
