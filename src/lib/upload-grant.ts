import crypto from 'crypto';

/**
 * Single-use upload grants for the anonymous evidence-upload path.
 *
 * The recovery report form at /asset-recovery/report is public, so it has to
 * be able to attach evidence without holding a session. Without something
 * like this, /api/upload is an open proxy that spends our Cloudinary secret
 * and quota on whatever an anonymous caller sends.
 *
 * A grant is 16 random bytes, valid for 15 minutes, and consumed on first
 * use. State is per process, so this is a speed bump against casual abuse
 * rather than a security boundary on its own - it is defence in depth
 * alongside the rate limit, type check and size cap in the route.
 */

const GRANT_TTL_MS = 15 * 60 * 1000;
const grants = new Map<string, number>();

export function issueUploadGrant(): string {
  const token = crypto.randomBytes(24).toString('hex');
  grants.set(token, Date.now() + GRANT_TTL_MS);

  // Opportunistic cleanup so the map does not grow without bound.
  if (grants.size > 1000) {
    const now = Date.now();
    for (const [key, expiresAt] of grants) {
      if (expiresAt <= now) grants.delete(key);
    }
  }

  return token;
}

/** Returns true only for a live, previously issued, not-yet-used grant. */
export function consumeUploadGrant(token: string | null | undefined): boolean {
  if (!token) return false;
  const expiresAt = grants.get(token);
  if (expiresAt === undefined) return false;
  grants.delete(token);
  return expiresAt > Date.now();
}
