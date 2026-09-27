/* eslint-disable */
// One-shot helper: replace the placeholder JWT_SECRET in .env.local with a
// cryptographically random secret. Run with: `node scripts/generate-jwt-secret.js`.
//
// After running, restart `npm run dev` so the new secret is loaded.

import { config } from 'dotenv';
import { randomBytes } from 'crypto';

config({ path: '.env.local' });

const envPath = '.env.local';
const PLACEHOLDER = '<your-random-jwt-secret>';

function generateSecret() {
  // 64 random bytes -> 128 hex chars. Long enough to be safe, short enough
  // to fit comfortably in an env file.
  return randomBytes(64).toString('hex');
}

function escapeForEnv(value) {
  // Wrap in single quotes and escape any single quotes inside the value.
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

async function main() {
  const fs = await import('fs/promises');
  let raw = '';
  try {
    raw = await fs.readFile(envPath, 'utf8');
  } catch {
    console.error(`Could not read ${envPath}. Make sure you run this from the project root.`);
    process.exit(1);
  }

  const newSecret = generateSecret();
  const escaped = escapeForEnv(newSecret);

  let updated;
  if (raw.match(/^JWT_SECRET\s*=/m)) {
    updated = raw.replace(/^JWT_SECRET\s*=.*$/m, `JWT_SECRET=${escaped}`);
  } else {
    updated = raw.trimEnd() + `\n\n# Authentication\nJWT_SECRET=${escaped}\n`;
  }

  await fs.writeFile(envPath, updated, 'utf8');
  console.log('JWT_SECRET rotated in .env.local.');
  console.log('');
  console.log(`Previous value starts with: ${PLACEHOLDER}`);
  console.log('New value length:', newSecret.length, 'characters');
  console.log('');
  console.log('Restart the dev server for the change to take effect:');
  console.log('  Ctrl+C  (stop)');
  console.log('  npm run dev   (start)');
}

main().catch((err) => {
  console.error('Failed to rotate JWT_SECRET:', err);
  process.exit(1);
});
