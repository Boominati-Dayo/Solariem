import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export function validatePin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

export async function verifyTransactionPin(pin: string, storedPin?: string | null): Promise<boolean> {
  if (!storedPin) {
    return false;
  }

  // New users have bcrypt-hashed pins; legacy/seeded users may have plaintext
  if (storedPin.startsWith('$2')) {
    return bcrypt.compare(pin, storedPin);
  }

  return pin === storedPin;
}

export async function verifyPinForUser(user: (Record<string, unknown> | { transactionPin?: string | null }) | null | undefined, pin?: string | null): Promise<boolean> {
  if (!pin) {
    return false;
  }
  return verifyTransactionPin(pin, user?.['transactionPin'] as string | null | undefined);
}
