import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAuthTrigger() {
  console.log('🔧 Setting up auth trigger...\n');

  // Read the SQL file
  const sqlPath = path.join(__dirname, 'setup-auth-trigger.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('📝 SQL to execute:');
  console.log(sql);
  console.log('\n⚠️  Note: This script requires database admin access.');
  console.log('Please run this SQL manually in Supabase Dashboard > SQL Editor:\n');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Click "SQL Editor" in the left sidebar');
  console.log('4. Paste the SQL above');
  console.log('5. Click "Run"\n');
  console.log('Or use the Supabase CLI:');
  console.log('npx supabase db execute --file scripts/setup-auth-trigger.sql\n');
}

setupAuthTrigger();
