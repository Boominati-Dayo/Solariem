/**
 * Load environment variables the way Next.js does.
 *
 * The problem this solves: `import 'dotenv/config'` reads `.env` and nothing
 * else. But a Next.js app's real configuration lives in `.env.local`, which
 * dotenv never touches. The result is that every script in this directory
 * reported "MONGODB_URI is not set" while the application itself connected to
 * the database perfectly happily — which reads as a broken script rather than
 * a broken loader, and is very easy to waste an hour on.
 *
 * Precedence matches Next.js: `.env.local` wins over `.env`, and neither
 * overrides a variable that is already set in the real environment.
 *
 * Usage:
 *   import './load-env.mjs';       // from scripts/
 *   import { config } from 'dotenv';
 */
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Lowest precedence first, so later files overwrite earlier ones.
for (const file of ['.env', '.env.local']) {
  const path = resolve(ROOT, file);
  if (existsSync(path)) {
    config({ path, override: false, quiet: true });
  }
}
