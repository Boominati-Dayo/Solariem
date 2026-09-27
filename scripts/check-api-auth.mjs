#!/usr/bin/env node
/**
 * Fails if any API route is exported without an auth guard.
 *
 * WHY THIS EXISTS
 * There is no src/middleware.ts, so authorisation is entirely opt-in: a route
 * is protected only if it wraps itself in requireAuth()/requireAdmin(). Eight
 * admin routes shipped unprotected that way, including one that moved balances
 * and one that was an open mail relay. Nothing failed loudly at build time and
 * nothing failed at runtime — they simply answered unauthenticated callers.
 *
 * So this check is mechanical and belongs in CI. Run:
 *   node scripts/check-api-auth.mjs
 *
 * ADDING A ROUTE: wrap the handler, or add an explicit ignore below with a
 * reason. A public route must be listed deliberately, never by omission.
 */

import fs from 'fs';
import path from 'path';

const API_DIR = path.join(process.cwd(), 'src', 'app', 'api');

/**
 * Routes intentionally reachable without a session, each with its reason.
 *
 * This list is a decision, not a backlog. Adding a name here means deciding
 * in public that the route is meant to be open. Prefer a guard plus a
 * narrow, rate-limited public path (see /api/upload + /api/upload/grant).
 */
const PUBLIC_ROUTES = new Map([
  // --- Credential lifecycle. Each one either establishes or tears down a
  // --- session, or is the token-validating step inside such a flow. An
  // --- anonymous caller reaching them gets a 401 or a validation error,
  // --- never another user's data.
  ['auth/login', 'establishes a session'],
  ['auth/register', 'creates a session'],
  ['auth/logout', 'clears a session cookie'],
  ['auth/me', 'returns the caller\'s own record, 401 without a token'],
  ['auth/forgot-password', 'starts a reset; sends only to the address on file'],
  ['auth/reset-password', 'completes a reset using a single-use token'],
  ['auth/confirm-reset-password', 'step of the reset flow'],
  ['auth/validate-reset-token', 'validates a reset token for the holder'],
  ['auth/send-verification', 'sends to the address on file only'],
  ['auth/verify-email', 'completes verification using a token'],

  // --- Public acquisition surface. These accept anonymous writes, so each
  // --- one is rate limited in its own handler. See src/lib/rate-limit.ts.
  ['contact', 'public contact form; rate limited'],
  ['newsletter/subscribe', 'public subscribe form; rate limited'],
  ['public-recovery', 'public report form; rate limited'],
  ['upload/grant', 'mints a single-use upload grant; rate limited'],

  // --- Public reads. No caller-supplied identifier reaches a record, and
  // --- each returns a fixed field set.
  ['public-recovery/track', 'case lookup by claim number; fixed projection, uniform 404'],
  ['testimonials', 'returns published testimonials only'],

  // --- 'upload' is NOT public. It is wrapped in optional auth: anonymous
  // --- callers must present a single-use grant from upload/grant, and the
  // --- file is validated by magic bytes and size before it is forwarded.
]);

/** Guard function names that satisfy the check. */
const GUARDS = ['requireAdmin', 'requireAuth'];

/**
 * Routes that must serve anonymous callers (public forms) but still consult
 * the session. These opt in with an `@optional-auth` annotation, and the
 * annotation only counts if the route actually calls authenticateRequest --
 * so the tag cannot be used to skip authentication by assertion alone.
 *
 * An @optional-auth route must reject anonymous callers by some other means
 * (a single-use grant, a captcha, a signature). This script cannot verify
 * that; it can only make the exemption deliberate and reviewable.
 */
const OPTIONAL_AUTH_GUARD = 'authenticateRequest';

const HTTP_METHOD = /export\s+(?:const|async\s+function)\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/g;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name === 'route.ts' || entry.name === 'route.js') out.push(full);
  }
  return out;
}

/** `app/api/admin/cards/[id]/route.ts` -> `admin/cards/[id]` */
function routeId(file) {
  return path
    .relative(API_DIR, path.dirname(file))
    .split(path.sep)
    .join('/')
    .replace(/\\/g, '/');
}

if (!fs.existsSync(API_DIR)) {
  console.error('No src/app/api directory found.');
  process.exit(1);
}

const routes = walk(API_DIR);
const problems = [];
const optionalAuthRoutes = [];
let checked = 0;

for (const file of routes) {
  const id = routeId(file);
  if (PUBLIC_ROUTES.has(id)) continue;

  const src = fs.readFileSync(file, 'utf8');

  // Count exported handlers and count the guard invocations in this file.
  const handlers = [...src.matchAll(HTTP_METHOD)].map((m) => m[1]);
  if (handlers.length === 0) continue;

  const guarded = GUARDS.some((g) => new RegExp(`\\b${g}\\s*\\(`).test(src));
  const optionalAuth =
    /@optional-auth/.test(src) &&
    new RegExp(`\\b${OPTIONAL_AUTH_GUARD}\\s*\\(`).test(src);
  const explicitlyIgnored = /@public-route|allowUnauthenticated/.test(src);

  checked += handlers.length;

  if (optionalAuth) optionalAuthRoutes.push(id);

  if (!guarded && !optionalAuth && !explicitlyIgnored) {
    problems.push(`  ${id}  (${handlers.length} handler${handlers.length > 1 ? 's' : ''})`);
  }
}

if (problems.length > 0) {
  console.error(`\nFAIL: ${problems.length} API route(s) with no auth guard.\n`);
  console.error(problems.join('\n'));
  console.error(
    '\nEach of these is reachable by an unauthenticated caller. Wrap the handler\n' +
      'in requireAdmin() (or requireAuth()), tag it @optional-auth if it must\n' +
      'serve anonymous callers but still consults the session, or add it to\n' +
      'PUBLIC_ROUTES in scripts/check-api-auth.mjs with a reason.\n'
  );
  process.exit(1);
}

console.log(`OK: ${checked} API handlers across ${routes.length} routes are guarded.`);
if (optionalAuthRoutes.length > 0) {
  console.log(
    `     ${optionalAuthRoutes.length} route(s) use optional auth (must reject anonymous callers by another means):`
  );
  for (const id of optionalAuthRoutes) console.log(`       - ${id}`);
}
