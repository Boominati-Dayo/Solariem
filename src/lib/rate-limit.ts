import { NextRequest, NextResponse } from 'next/server';

/**
 * Fixed-window rate limiter for the handful of routes that must stay
 * reachable without a session (contact form, newsletter, public recovery
 * report, evidence upload).
 *
 * WHY IT EXISTS
 * Those routes send email and write to the database on behalf of whoever
 * calls them. With no auth and no limit, `POST /api/public-recovery` is a
 * mail relay: anyone can make the server send mail to any address they
 * choose, which burns the sending domain's reputation and floods the admin
 * inbox. Same shape for the contact form and the newsletter endpoint.
 *
 * LIMITATION - READ THIS BEFORE RELYING ON IT
 * State is held in this Node process, so the limit is per instance. On a
 * multi-instance or serverless deployment N instances means N times the
 * limit, and a restart clears it. That is enough to stop casual abuse and
 * scripted retries; it is not a substitute for a shared store. If this
 * needs to hold under real attack traffic, put a shared store (Redis, or
 * Cloudflare rate limiting in front of the app) behind the same interface.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Stop the map growing without bound on a long-lived process.
const SWEEP_INTERVAL_MS = 60_000;
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Best-effort client address. Behind a proxy this is the proxy's address
 * unless the platform sets x-forwarded-for, so treat the limit as indicative.
 */
function clientKey(request: NextRequest, scope: string): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded
    ? forwarded.split(',')[0].trim()
    : request.headers.get('x-real-ip') || 'unknown';
  return `${scope}:${ip}`;
}

export interface RateLimitOptions {
  /** Window length in ms. */
  windowMs: number;
  /** Requests permitted per window, per client. */
  max: number;
  /** Namespaces the counter so limits do not bleed across routes. */
  scope: string;
  /** Message returned to the caller. */
  message?: string;
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, scope, message = 'Too many requests. Please try again later.' } = options;

  return function check(request: NextRequest): NextResponse | null {
    const now = Date.now();
    sweep(now);

    const key = clientKey(request, scope);
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return null;
    }

    if (bucket.count >= max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      return NextResponse.json(
        { success: false, error: message },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    bucket.count += 1;
    return null;
  };
}
