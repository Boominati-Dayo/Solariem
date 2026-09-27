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
 * One deliberate exception: `next build` runs with NODE_ENV=production while
 * statically rendering pages, and it does not have your deploy-time secrets in
 * scope on a developer machine. Building is therefore allowed to see the
 * localhost default. The failure surfaces when the built app actually serves a
 * request, which is the point at which a wrong canonical URL would do damage.
 */

const PHASE_PRODUCTION_BUILD = 'phase-production-build';

const isBuild = () => process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;
const isProd = () => process.env.NODE_ENV === 'production';

/** True when we should enforce production rules. False during `next build`. */
const enforce = () => isProd() && !isBuild();

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
