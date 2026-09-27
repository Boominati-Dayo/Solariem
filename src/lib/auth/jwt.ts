import jwt, { TokenExpiredError, JsonWebTokenError, NotBeforeError } from 'jsonwebtoken';

const RAW_SECRET = process.env.JWT_SECRET;

const PLACEHOLDERS = [
  'your-super-secret-jwt-key-change-in-production',
  'changeme',
  'secret',
];

/**
 * A session token is a bearer credential: anyone holding a validly signed one is
 * the user it names, including an admin. So the signing key must never be
 * guessable.
 *
 * Previously an unset JWT_SECRET silently fell back to a hardcoded string that
 * was committed to this repository. That is not a development convenience, it
 * is a remote authentication bypass: with the fallback in place, anyone who
 * has read the source could mint an `isAdmin: true` token and use it against
 * every endpoint guarded by `requireAdmin`.
 *
 * In development we still fall back, so a fresh clone runs without setup. In
 * production we refuse to start. Failing closed is the only safe default for a
 * credential that grants account access.
 */
const isUnusable =
  !RAW_SECRET || RAW_SECRET.startsWith('<') || PLACEHOLDERS.includes(RAW_SECRET);

if (isUnusable && process.env.NODE_ENV === 'production') {
  throw new Error(
    '[jwt] JWT_SECRET is missing or is still a placeholder, and NODE_ENV is production. ' +
      'Refusing to sign session tokens with a known key. Generate one with ' +
      '`node scripts/generate-jwt-secret.js`, set it in the environment, and restart. ' +
      'Anyone able to read the source could otherwise forge an admin token.'
  );
}

if (isUnusable) {
  console.warn(
    '[jwt] JWT_SECRET is not set or is still a placeholder. Falling back to an ' +
      'ephemeral development key: tokens will not verify after a restart, and any ' +
      'other process with a different key will reject them. Never do this in ' +
      'production. Run `node scripts/generate-jwt-secret.js` to fix.'
  );
}

// Ephemeral per-process key: nothing is shared, and it cannot outlive the
// process. Deliberately generated rather than hardcoded.
const JWT_SECRET = isUnusable
  ? require('crypto').randomBytes(48).toString('hex')
  : RAW_SECRET;

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 30 seconds of clock-skew tolerance so that a slightly fast or slow issuer
// doesn't make tokens look "expired" or "not yet valid" to the verifier.
const VERIFY_OPTIONS = { clockTolerance: 30 } as const;

export interface JWTPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as Record<string, unknown>);
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, VERIFY_OPTIONS) as JWTPayload;
    return decoded;
  } catch (error) {
    let kind: 'expired' | 'invalid_signature' | 'malformed';
    let message: string;
    if (error instanceof TokenExpiredError) {
      kind = 'expired';
      message = 'expired';
    } else if (error instanceof JsonWebTokenError) {
      kind = 'invalid_signature';
      message = error.message;
    } else if (error instanceof NotBeforeError) {
      kind = 'invalid_signature';
      message = 'not yet valid';
    } else {
      kind = 'malformed';
      message = error instanceof Error ? error.message : String(error);
    }
    logVerifyFailure('Token', kind, token, message);
    return null;
  }
}

export function generateEmailVerificationToken(userId: string): string {
  return jwt.sign({ userId, type: 'email-verification' }, JWT_SECRET, { expiresIn: '7d' } as Record<string, unknown>);
}

export function generatePasswordResetToken(userId: string): string {
  return jwt.sign({ userId, type: 'password-reset' }, JWT_SECRET, { expiresIn: '4h' } as Record<string, unknown>);
}

export function verifyEmailVerificationToken(token: string): { userId: string } | null {
  const result = tryVerify(token);
  if (!result) return null;
  if (result.decoded.type === 'email-verification' && typeof result.decoded.userId === 'string') {
    return { userId: result.decoded.userId };
  }
  console.warn(
    '[jwt] Email verification token has wrong type or missing userId:',
    JSON.stringify({ type: result.decoded.type, hasUserId: !!result.decoded.userId })
  );
  return null;
}

export function verifyPasswordResetToken(token: string): { userId: string } | null {
  const result = tryVerify(token);
  if (!result) return null;
  if (result.decoded.type === 'password-reset' && typeof result.decoded.userId === 'string') {
    return { userId: result.decoded.userId };
  }
  console.warn(
    '[jwt] Password reset token has wrong type or missing userId:',
    JSON.stringify({ type: result.decoded.type, hasUserId: !!result.decoded.userId })
  );
  return null;
}

interface VerifyOutcome {
  decoded: { userId: string; type?: string; iat?: number; exp?: number };
  failure?: { kind: 'expired' | 'invalid_signature' | 'malformed'; message: string };
}

function tryVerify(token: string): VerifyOutcome | null {
  // jwt.decode() reads the header + payload without checking the signature.
  // This is the only way to know whether the token arrived intact before
  // signature verification fails (so we can distinguish 'corrupted token'
  // from 'wrong secret' in the server log).
  const decodedRaw = jwt.decode(token, { complete: false });
  if (!decodedRaw || typeof decodedRaw !== 'object') {
    logVerifyFailure('Token', 'malformed', token);
    return null;
  }
  const decoded = decodedRaw as { userId: string; type?: string; iat?: number; exp?: number };

  try {
    jwt.verify(token, JWT_SECRET, VERIFY_OPTIONS);
    return { decoded };
  } catch (error) {
    let kind: 'expired' | 'invalid_signature' | 'malformed';
    let message: string;
    if (error instanceof TokenExpiredError) {
      kind = 'expired';
      message = 'expired';
    } else if (error instanceof JsonWebTokenError) {
      kind = 'invalid_signature';
      message = error.message;
    } else if (error instanceof NotBeforeError) {
      kind = 'invalid_signature';
      message = 'not yet valid';
    } else {
      kind = 'malformed';
      message = error instanceof Error ? error.message : String(error);
    }
    logVerifyFailure('Token', kind, token, message, decoded);
    return null;
  }
}

function logVerifyFailure(
  label: string,
  kind: 'expired' | 'invalid_signature' | 'malformed',
  token: string,
  detail?: string,
  decoded?: { userId?: string; type?: string; iat?: number; exp?: number } | null
) {
  const len = token?.length ?? 0;
  const head = token ? token.slice(0, 12) : '';
  const tail = token ? token.slice(-12) : '';
  const secretIsPlaceholder = !RAW_SECRET || RAW_SECRET.startsWith('<') || RAW_SECRET === 'your-super-secret-jwt-key-change-in-production';
  const hint = secretIsPlaceholder
    ? ' | NOTE: server JWT_SECRET is the placeholder; rotate with `node scripts/generate-jwt-secret.js` and restart.'
    : '';
  console.warn(
    `[jwt] ${label} ${kind}${detail ? ' (' + detail + ')' : ''}: len=${len} head=${head}… tail=…${tail}` +
      (decoded ? ` payload=${JSON.stringify({ uid: decoded.userId, type: decoded.type, iat: decoded.iat, exp: decoded.exp })}` : '') +
      hint
  );
}
