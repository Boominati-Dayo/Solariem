/**
 * Validated access to environment configuration.
 *
 * Why this exists: the codebase used to read configuration with
 * `process.env.X || 'some-default'` scattered across a dozen files. That is
 * convenient right up to the moment it is not — a missing variable becomes a
 * silent fallback to a value that was never chosen for that environment, and
 * the app runs against the wrong database or emits links to localhost while
 * looking perfectly healthy.
 *
 * Rules enforced here:
 *   1. Required variables have no default. Missing means a hard failure with a
 *      message naming the variable, not a substitute value.
 *   2. Placeholder values are rejected in production for the same reason: a
 *      variable that is *set* to something meaningless fails just as quietly as
 *      one that is unset.
 *   3. localhost is rejected for the canonical site URL in production, because
 *      that value propagates into canonical tags, the sitemap, Open Graph URLs
 *      and JSON-LD ids. Getting it wrong is worse than not starting.
 *
 * Two deliberate exceptions, both about WHERE the check runs rather than
 * whether it runs:
 *
 * 1. Server only. This module is imported by files that end up in the browser
 *    bundle, and `process.env.NODE_ENV` is inlined as "production" there, so
 *    an unguarded check would throw in the client and take the whole page down
 *    with a blank error screen. A configuration mistake must surface as a
 *    server-side error with a useful message, never as a broken UI. It is also
 *    futile to check client-side: `NEXT_PUBLIC_*` values are inlined at build
 *    time, so if the variable was missing from the build environment the
 *    browser has no way to recover it.
 *
 * 2. `next build` is allowed to see the localhost default. It runs with
 *    NODE_ENV=production but does not have your deploy-time values in scope on
 *    a developer machine, and it statically renders pages that read SITE_URL.
 *    Failing the build there would block the very act of fixing the value.
 *    The failure surfaces when the built app serves a request, which is the
 *    point at which a wrong canonical URL would do damage.
 */

const PHASE_PRODUCTION_BUILD = 'phase-production-build';

const isBuild = () => process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;
const isProd = () => process.env.NODE_ENV === 'production';
const isServer = () => typeof window === 'undefined';

/**
 * True when we should enforce production rules.
 *
 * Server only, and never during `next build`. See the note at the top of this
 * file for why a browser-side throw is the wrong behaviour.
 */
const enforce = () => isProd() && isServer() && !isBuild();

/**
 * Values that are technically set but functionally placeholders. Each is tied
 * to a specific variable so the error can say which one is wrong.
 */
const PLACEHOLDERS: Record<string, string[]> = {
  NEXT_PUBLIC_SITE_URL: ['http://localhost:3000', 'localhost', 'example.com'],
  NEXT_PUBLIC_APP_URL: ['http://localhost:3000', 'localhost', 'example.com'],
  MONGODB_URI: ['mongodb://localhost', '<username>', '<password>'],
  EMAIL_FROM: ['example.com', 'example.org'],
  ADMIN_EMAIL: ['example.com', 'example.org'],
  SMTP_USER: ['example.com', 'example.org'],
};

function fail(name: string, problem: string): never {
  throw new Error(
    `Configuration error: ${name} ${problem}.\n` +
      `Set it in .env.local for development, or in the deployment platform's ` +
      `environment settings for production. See .env.example for the full list.`
  );
}

/**
 * Read a variable that must have a real value.
 *
 * Read the literal `process.env.NAME` at the call site, never a computed key:
 * Next.js inlines `NEXT_PUBLIC_*` variables at build time by textual
 * substitution, so `process.env[name]` would come back undefined in the
 * browser bundle.
 */
export function requireEnv<T extends string>(name: string, value: T | undefined, devFallback?: T): T {
  if (value && value.trim() !== '') {
    const bad = PLACEHOLDERS[name];
    if (enforce() && bad?.some((p) => value.includes(p))) {
      fail(name, `is set to the placeholder "${value}"`);
    }
    return value;
  }
  if (enforce()) {
    fail(name, 'is required but was not set');
  }
  // Development, or a build-time render. A default keeps `next dev` and
  // `next build` working on a fresh clone without pretending to be configured.
  return (devFallback ?? (value as T)) as T;
}

/**
 * The canonical public origin. Every absolute URL the app emits derives from
 * this, so it is validated rather than defaulted.
 */
export const SITE_URL = (() => {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  const url = requireEnv('NEXT_PUBLIC_SITE_URL', raw, 'http://localhost:3000');
  return url.replace(/\/+$/, '');
})();

/** Where the app is served from. Defaults to the canonical origin. */
export const APP_URL = (() => {
  const raw = process.env.NEXT_PUBLIC_APP_URL;
  const url = requireEnv('NEXT_PUBLIC_APP_URL', raw, SITE_URL);
  return url.replace(/\/+$/, '');
})();

/** Human-readable summary for the startup log. Never prints a secret. */
export function describeConfig(): string {
  return [
    `  site      ${SITE_URL}`,
    `  app       ${APP_URL}`,
    `  database  ${process.env.MONGODB_DB || '(unset)'}`,
    `  smtp      ${process.env.SMTP_HOST || '(unset)'}:${process.env.SMTP_PORT || '(unset)'}`,
    `  mail from ${process.env.EMAIL_FROM || '(unset)'}`,
  ].join('\n');
}
