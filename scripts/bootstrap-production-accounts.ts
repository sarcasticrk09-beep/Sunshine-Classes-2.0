import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const prodUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const prodServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!prodUrl || !prodServiceKey) {
  console.error('ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const adminClient = createClient(prodUrl, prodServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

interface AccountInit {
  email: string;
  role: string;
  name: string;
  username: string;
  password?: string;
  class_name?: string;
  roll_no?: string;
}

const ACCOUNTS_TO_PROVISION: AccountInit[] = [
  {
    email: 'admin@sunshineclasses.net',
    username: 'admin',
    role: 'ADMIN',
    name: 'Master Administrator',
    password: 'Sunshine@Admin2026!'
  },
  {
    email: 'founder@sunshineclasses.net',
    username: 'founder',
    role: 'FOUNDER',
    name: 'Institute Director',
    password: 'Sunshine@Founder2026!'
  },
  {
    email: 'reception@sunshineclasses.net',
    username: 'reception',
    role: 'RECEPTIONIST',
    name: 'Front Desk Reception',
    password: 'Sunshine@Reception2026!'
  },
  {
    email: 'teacher.math@sunshineclasses.net',
    username: 'teacher.math',
    role: 'TEACHER',
    name: 'Suresh Verma (Math HOD)',
    password: 'Sunshine@Teacher2026!'
  },
  {
    email: 'student.rahul@sunshineclasses.net',
    username: 'rahul.sharma',
    role: 'STUDENT',
    name: 'Rahul Sharma',
    class_name: 'Class 10',
    roll_no: 'SC-1001',
    password: 'Sunshine@Student2026!'
  },
  {
    email: 'student.priya@sunshineclasses.net',
    username: 'priya.verma',
    role: 'STUDENT',
    name: 'Priya Verma',
    class_name: 'Class 9',
    roll_no: 'SC-1002',
    password: 'Sunshine@Student2026!'
  }
];

async function bootstrapProduction() {
  console.log('===========================================================');
  console.log('  SUNSHINE CLASSES ERP - PRODUCTION ACCOUNT PROVISIONER    ');
  console.log('===========================================================');
  console.log(`Target: ${prodUrl}\n`);

  // Fetch existing users
  const { data: existingData, error: listError } = await adminClient.auth.admin.listUsers({ perPage: 100 });
  if (listError) {
    console.error('Failed to list existing auth users:', listError.message);
    process.exit(1);
  }

  const existingByEmail = new Map<string, any>();
  if (existingData?.users) {
    for (const u of existingData.users) {
      if (u.email) existingByEmail.set(u.email.toLowerCase(), u);
    }
  }

  console.log(`Found ${existingByEmail.size} existing users in Supabase Auth.\n`);

  const results: any[] = [];

  for (const acc of ACCOUNTS_TO_PROVISION) {
    const emailKey = acc.email.toLowerCase();
    const existing = existingByEmail.get(emailKey);
    let userId = existing?.id;
    let authStatus = 'EXISTS';

    try {
      if (!existing) {
        const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
          email: acc.email,
          password: acc.password || 'Sunshine@123',
          email_confirm: true,
          user_metadata: {
            name: acc.name,
            role: acc.role,
            username: acc.username
          }
        });

        if (createErr) {
          console.error(`❌ Failed to create auth user [${acc.email}]:`, createErr.message);
          authStatus = `ERROR: ${createErr.message}`;
        } else if (created.user) {
          userId = created.user.id;
          authStatus = 'CREATED';
          console.log(`✅ Created Supabase Auth user: ${acc.email} (UUID: ${userId})`);
        }
      } else {
        // Update metadata & password
        await adminClient.auth.admin.updateUserById(userId, {
          password: acc.password || 'Sunshine@123',
          user_metadata: {
            name: acc.name,
            role: acc.role,
            username: acc.username
          },
          email_confirm: true
        });
        authStatus = 'UPDATED';
        console.log(`ℹ️  Updated Supabase Auth user: ${acc.email} (UUID: ${userId})`);
      }

      // If user is valid, attempt public.users upsert
      let dbStatus = 'SKIPPED';
      if (userId) {
        const { error: userTableErr } = await adminClient.from('users').upsert({
          id: userId,
          email: acc.email,
          name: acc.name,
          role: acc.role,
          username: acc.username,
          phone: '8707738284',
          active: true,
          force_password_change: false,
          created_at: new Date().toISOString()
        });

        if (userTableErr) {
          dbStatus = `DB ERROR: ${userTableErr.code} - ${userTableErr.message}`;
        } else {
          dbStatus = 'SYNCED';

          // If student, also sync to public.students
          if (acc.role === 'STUDENT' && acc.roll_no) {
            await adminClient.from('students').upsert({
              id: userId,
              user_id: userId,
              name: acc.name,
              roll_no: acc.roll_no,
              class_name: acc.class_name || 'Class 10',
              preferred_batch: 'Morning Batch A',
              status: 'ACTIVE',
              monthly_fee: 1000,
              father_name: 'Parent Guardian',
              contact_number: '8707738284',
              admission_date: new Date().toISOString().split('T')[0]
            });
          }
        }
      }

      results.push({
        role: acc.role,
        email: acc.email,
        username: acc.username,
        password: acc.password,
        authStatus,
        dbStatus
      });
    } catch (e: any) {
      console.error(`Exception on ${acc.email}:`, e?.message);
    }
  }

  console.log('\n===========================================================');
  console.log('PROVISIONING SUMMARY TABLE:');
  console.table(results.map(r => ({
    Role: r.role,
    Username: r.username,
    Email: r.email,
    Password: r.password,
    Auth: r.authStatus,
    Database: r.dbStatus
  })));
  console.log('===========================================================');
}

bootstrapProduction().catch(console.error);
