/**
 * Railway & Production Environment Configuration Validator
 * Sunshine Classes ERP
 * 
 * Run with: npm run validate:env (or npx tsx scripts/validate-railway-env.ts)
 */

interface EnvRule {
  name: string;
  required: boolean;
  category: 'System & Security' | 'Database / Supabase' | 'AI & Gemini' | 'Cloudinary Media' | 'Email & Alerts' | 'WhatsApp Meta';
  description: string;
  defaultVal?: string;
  validate?: (val: string) => { valid: boolean; message?: string };
}

const ENV_RULES: EnvRule[] = [
  // 1. Core System & Security
  {
    name: 'NODE_ENV',
    required: false,
    category: 'System & Security',
    description: 'Application environment mode (production/development)',
    defaultVal: 'production'
  },
  {
    name: 'PORT',
    required: false,
    category: 'System & Security',
    description: 'Server listening port injected automatically by Railway',
    defaultVal: '3000'
  },
  {
    name: 'APP_URL',
    required: true,
    category: 'System & Security',
    description: 'Public URL of the app on Railway (e.g. https://sunshine-erp.up.railway.app)',
    validate: (val) => ({
      valid: val.startsWith('http://') || val.startsWith('https://'),
      message: 'APP_URL should start with http:// or https://'
    })
  },
  {
    name: 'JWT_SECRET',
    required: true,
    category: 'System & Security',
    description: 'Cryptographic secret string for signing JWT session tokens',
    validate: (val) => ({
      valid: val.length >= 16,
      message: 'JWT_SECRET should be at least 16 characters long for production security'
    })
  },

  // 2. Database & Supabase
  {
    name: 'VITE_SUPABASE_URL',
    required: false,
    category: 'Database / Supabase',
    description: 'Client-side Supabase project endpoint (e.g. https://xyz.supabase.co)'
  },
  {
    name: 'VITE_SUPABASE_ANON_KEY',
    required: false,
    category: 'Database / Supabase',
    description: 'Client-side Supabase anonymous API public key'
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: false,
    category: 'Database / Supabase',
    description: 'Server-side privileged Supabase service role key (Never expose to client)'
  },

  // 3. AI & Gemini
  {
    name: 'GEMINI_API_KEY',
    required: false,
    category: 'AI & Gemini',
    description: 'Google Gemini API Key for question generation, AI doubt solver, and summaries'
  },

  // 4. Cloudinary Media Storage
  {
    name: 'CLOUDINARY_CLOUD_NAME',
    required: false,
    category: 'Cloudinary Media',
    description: 'Cloudinary cloud name for media & document uploads'
  },
  {
    name: 'CLOUDINARY_API_KEY',
    required: false,
    category: 'Cloudinary Media',
    description: 'Cloudinary server API key'
  },
  {
    name: 'CLOUDINARY_API_SECRET',
    required: false,
    category: 'Cloudinary Media',
    description: 'Cloudinary server secret key'
  },
  {
    name: 'VITE_CLOUDINARY_CLOUD_NAME',
    required: false,
    category: 'Cloudinary Media',
    description: 'Client-side Cloudinary cloud identifier'
  },
  {
    name: 'VITE_CLOUDINARY_UPLOAD_PRESET',
    required: false,
    category: 'Cloudinary Media',
    description: 'Unsigned upload preset name in Cloudinary Settings'
  },

  // 5. Email & SMTP
  {
    name: 'SMTP_HOST',
    required: false,
    category: 'Email & Alerts',
    description: 'SMTP host (e.g. smtp-relay.brevo.com)'
  },
  {
    name: 'SMTP_PORT',
    required: false,
    category: 'Email & Alerts',
    description: 'SMTP port (587 for TLS, 465 for SSL)'
  },
  {
    name: 'SMTP_USER',
    required: false,
    category: 'Email & Alerts',
    description: 'SMTP username / login email'
  },
  {
    name: 'SMTP_PASS',
    required: false,
    category: 'Email & Alerts',
    description: 'SMTP password or API key'
  },
  {
    name: 'SMTP_FROM',
    required: false,
    category: 'Email & Alerts',
    description: 'Sender email header (e.g. Sunshine Classes <info@sunshineclasses.net>)'
  },

  // 6. Meta WhatsApp
  {
    name: 'META_ACCESS_TOKEN',
    required: false,
    category: 'WhatsApp Meta',
    description: 'System User Permanent Access Token from Meta Business Suite'
  },
  {
    name: 'META_PHONE_NUMBER_ID',
    required: false,
    category: 'WhatsApp Meta',
    description: 'WhatsApp Business Phone Number ID'
  },
  {
    name: 'META_VERIFY_TOKEN',
    required: false,
    category: 'WhatsApp Meta',
    description: 'Webhook verification secret string'
  }
];

export function validateRailwayEnvironment() {
  console.log('\n======================================================');
  console.log('   SUNSHINE CLASSES ERP - RAILWAY ENVIRONMENT CHECK   ');
  console.log('======================================================\n');

  let hasErrors = false;
  let missingRequiredCount = 0;
  let missingOptionalCount = 0;

  const categories = Array.from(new Set(ENV_RULES.map(r => r.category)));

  for (const category of categories) {
    console.log(`\x1b[1m[ ${category} ]\x1b[0m`);
    const rules = ENV_RULES.filter(r => r.category === category);

    for (const rule of rules) {
      const val = process.env[rule.name];
      const isPresent = val !== undefined && val !== null && val.trim() !== '';

      if (!isPresent) {
        if (rule.required) {
          hasErrors = true;
          missingRequiredCount++;
          console.log(`  ❌ \x1b[31m${rule.name}\x1b[0m: MISSING (REQUIRED)`);
          console.log(`     └─ Description: ${rule.description}`);
        } else {
          missingOptionalCount++;
          const defaultMsg = rule.defaultVal ? ` (Default: "${rule.defaultVal}")` : '';
          console.log(`  ⚠️  \x1b[33m${rule.name}\x1b[0m: Not Set (Optional)${defaultMsg}`);
        }
      } else {
        if (rule.validate) {
          const res = rule.validate(val);
          if (!res.valid) {
            hasErrors = true;
            console.log(`  ❌ \x1b[31m${rule.name}\x1b[0m: INVALID VALUE`);
            console.log(`     └─ Error: ${res.message || 'Validation failed'}`);
            continue;
          }
        }
        const masked = rule.name.includes('SECRET') || rule.name.includes('KEY') || rule.name.includes('PASS') || rule.name.includes('TOKEN')
          ? `${val.slice(0, 4)}...${val.slice(-3)}`
          : val;
        console.log(`  ✅ \x1b[32m${rule.name}\x1b[0m: Configured (${masked})`);
      }
    }
    console.log('');
  }

  console.log('======================================================');
  if (hasErrors) {
    console.log(`❌ \x1b[31mVALIDATION FAILED:\x1b[0m ${missingRequiredCount} required variable(s) missing or invalid.`);
    console.log('👉 Please configure them in Railway Dashboard: Project -> Settings -> Variables\n');
    return false;
  } else {
    console.log('✅ \x1b[32mALL REQUIRED RAILWAY CONFIGURATIONS ARE VALID!\x1b[0m');
    if (missingOptionalCount > 0) {
      console.log(`ℹ️  ${missingOptionalCount} optional integration variable(s) are unset (app will run with graceful local fallbacks).`);
    }
    console.log('\n');
    return true;
  }
}

// Auto-run when executed directly via CLI
if (process.argv[1]?.includes('validate-railway-env')) {
  const success = validateRailwayEnvironment();
  if (!success && process.env.STRICT_ENV_CHECK === 'true') {
    process.exit(1);
  }
}
