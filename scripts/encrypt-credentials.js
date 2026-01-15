#!/usr/bin/env node

import crypto from 'crypto';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

const ALGORITHM = 'aes-256-gcm';

function encrypt(plaintext, masterKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(masterKey, 'hex'),
    iv
  );
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  return `${encrypted}:${iv.toString('hex')}:${authTag.toString('hex')}`;
}

function generateHash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  🔐 Credential Encryption Tool');
  console.log('═══════════════════════════════════════\n');

  // 1. Generar master key
  console.log('STEP 1: Generating ENCRYPTION_MASTER_KEY...');
  const masterKey = crypto.randomBytes(32).toString('hex');
  console.log(`✅ Generated: ${masterKey}\n`);
  console.log('⚠️  IMPORTANT: Save this key securely. You\'ll need it in .env.local\n');

  // 2. Solicitar credenciales
  console.log('STEP 2: Enter your credentials (they will be encrypted):\n');

  const credentials = {
    DASH_XPUB: await question('Dash xpub (testnet): '),
    RESEND_KEY: await question('Resend API Key: '),
    SUPABASE_SERVICE: await question('Supabase Service Role Key: '),
    ADMIN_EMAIL: await question('Your admin email: ')
  };

  // 3. Encriptar y generar hashes
  console.log('\nSTEP 3: Encrypting credentials...\n');
  console.log('═══════════════════════════════════════');
  console.log('  📋 Copy to .env.local');
  console.log('═══════════════════════════════════════\n');

  console.log(`ENCRYPTION_MASTER_KEY=${masterKey}\n`);

  for (const [name, value] of Object.entries(credentials)) {
    if (!value) {
      console.warn(`⚠️  Skipping empty: ${name}`);
      continue;
    }

    const encrypted = encrypt(value, masterKey);
    const hash = generateHash(value);

    console.log(`${name}_ENC=${encrypted}`);
    console.log(`${name}_HASH=${hash}\n`);
  }

  console.log('═══════════════════════════════════════');
  console.log('✅ Done! Copy the above to .env.local');
  console.log('⚠️  NEVER commit .env.local to Git');
  console.log('═══════════════════════════════════════\n');

  rl.close();
}

main().catch(console.error);
