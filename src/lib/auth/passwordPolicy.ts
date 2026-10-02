/**
 * THE PASSWORD POLICY. One definition, used by the form and the server.
 *
 * This module deliberately imports nothing. It is pulled into client bundles by
 * the signup and reset forms so they can say what is missing while someone is
 * still typing — and the obvious place to reach for, `lib/auth/password.ts`, has
 * `bcryptjs` at the top of it, which would drag a hashing library into the
 * browser to evaluate five regular expressions.
 *
 * `validatePassword` in that file delegates here. It did not used to, which is
 * how the two drifted apart in the first place: the reset page accepted anything
 * the signup page rejected, so a reader could set at signup a password that was
 * then refused at reset. `error` strings are reproduced exactly as they were,
 * because `confirm-reset-password` joins them and returns them to the reader as
 * the response body — changing the wording there changes an API response.
 *
 * The symbol rule is an allowlist, not "anything that is not alphanumeric", and
 * it should stay one. A broad rule looks friendlier but silently disagrees with
 * the server the first time someone uses a `£` or an accented character, and the
 * failure surfaces as a rejection after submission with no explanation.
 */

export type PasswordRule = {
  /** Short form for the on-screen checklist. */
  label: string;
  /** Reads correctly after "your password needs". */
  hint: string;
  /** Full sentence, returned by the API. Unchanged from the original. */
  error: string;
  ok: (password: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  {
    label: 'At least 8 characters',
    hint: 'at least 8 characters',
    error: 'Password must be at least 8 characters long',
    ok: (p) => p.length >= 8,
  },
  {
    label: 'A capital letter',
    hint: 'a capital letter',
    error: 'Password must contain at least one uppercase letter',
    ok: (p) => /[A-Z]/.test(p),
  },
  {
    label: 'A small letter',
    hint: 'a small letter',
    error: 'Password must contain at least one lowercase letter',
    ok: (p) => /[a-z]/.test(p),
  },
  {
    label: 'A number',
    hint: 'a number',
    error: 'Password must contain at least one number',
    ok: (p) => /\d/.test(p),
  },
  {
    label: 'A symbol',
    hint: 'a symbol',
    error: 'Password must contain at least one special character',
    ok: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p),
  },
];

/** The rules not yet satisfied, in order. Empty means acceptable. */
export function unmetRules(password: string): PasswordRule[] {
  return PASSWORD_RULES.filter((r) => !r.ok(password));
}

/** "a capital letter, a symbol" — reads correctly after "your password needs". */
export function missingHint(password: string): string {
  return unmetRules(password)
    .map((r) => r.hint)
    .join(', ');
}

export function isAcceptable(password: string): boolean {
  return unmetRules(password).length === 0;
}

/** Same shape `validatePassword` has always returned. */
export function checkPassword(password: string): { isValid: boolean; errors: string[] } {
  const errors = unmetRules(password).map((r) => r.error);
  return { isValid: errors.length === 0, errors };
}
