import { getDb } from '@/lib/mongodb';
import crypto from 'crypto';

// Generate a secure reset token
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Store reset token in MongoDB with expiration
export const storeResetToken = async (
  email: string,
  token: string,
  expirationTime: number
): Promise<void> => {
  try {
    const db = await getDb();
    const expiresAt = new Date(Date.now() + expirationTime);

    await db.collection('resetTokens').insertOne({
      email,
      token,
      expiresAt,
      createdAt: new Date(),
      used: false
    });

    // Create an index on token for fast lookup if it doesn't exist
    // This is idempotent and cheap to run
    await db.collection('resetTokens').createIndex({ token: 1 });
    // create TTL index to automatically delete expired tokens
    await db.collection('resetTokens').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  } catch (error) {
    console.error('Error storing reset token:', error);
    throw new Error('Failed to store reset token');
  }
};

// Verify and get reset token
export const getResetToken = async (token: string): Promise<{
  email: string;
  valid: boolean;
  expired: boolean;
} | null> => {
  try {
    const db = await getDb();
    const tokenDoc = await db.collection('resetTokens').findOne({ token });

    if (!tokenDoc) {
      return null;
    }

    const now = new Date();
    const expiresAt = new Date(tokenDoc.expiresAt);

    return {
      email: tokenDoc.email,
      valid: !tokenDoc.used,
      expired: now > expiresAt
    };
  } catch (error) {
    console.error('Error getting reset token:', error);
    return null;
  }
};

// Mark reset token as used
export const markResetTokenAsUsed = async (token: string): Promise<void> => {
  try {
    const db = await getDb();
    await db.collection('resetTokens').updateOne(
      { token },
      { $set: { used: true } }
    );
  } catch (error) {
    console.error('Error marking reset token as used:', error);
    throw new Error('Failed to mark reset token as used');
  }
};

// Clean up expired tokens (can be called periodically)
// MongoDB TTL index handles this automatically, but this can be kept for manual cleanup if needed
export const cleanupExpiredTokens = async (): Promise<void> => {
  try {
    const db = await getDb();
    await db.collection('resetTokens').deleteMany({
      expiresAt: { $lt: new Date() }
    });
    console.log('Cleaned up expired tokens');
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
};






