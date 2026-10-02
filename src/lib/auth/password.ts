import bcrypt from 'bcryptjs';
import { checkPassword } from './passwordPolicy';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Delegates to `passwordPolicy`. The rules live there because the signup and
 * reset forms need to evaluate them in the browser to explain what is missing,
 * and this module cannot be imported there without pulling bcrypt in with it.
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  return checkPassword(password);
}




