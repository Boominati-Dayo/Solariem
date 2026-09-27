import { NextRequest, NextResponse } from 'next/server';
import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { verifyEmailVerificationToken } from '@/lib/auth/jwt';
import { UserService } from '@/lib/auth/user';
import { NotificationService } from '@/lib/notifications/NotificationService';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, code: 'missing_token', error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // 1. Primary path: signature + expiry + type check
    let payload = verifyEmailVerificationToken(token);
    let usedFallback = false;

    // 2. Graceful fallback: if the server's JWT_SECRET was rotated after the
    //    link was issued, signature verification will fail. We can still
    //    trust the link if the user document stores the *exact same* token
    //    (DB is the source of truth, not the JWT signature in this case).
    if (!payload) {
      const decoded = jwt.decode(token);
      if (decoded && typeof decoded === 'object' && decoded.type === 'email-verification' && typeof decoded.userId === 'string') {
        const db = await getDb();
        const stored = await db.collection('users').findOne(
          { _id: new ObjectId(decoded.userId) },
          { projection: { emailVerificationToken: 1, emailVerified: 1 } }
        );
        if (stored && stored.emailVerificationToken === token && !stored.emailVerified) {
          payload = { userId: decoded.userId };
          usedFallback = true;
          console.warn(`[verify-email] Accepted token via DB match (server JWT_SECRET may have been rotated). userId=${decoded.userId}`);
        }
      }
    }

    if (!payload) {
      // Distinguish "expired" from "invalid" so the UI can show useful messaging.
      let code = 'invalid_token';
      try {
        jwt.verify(token, process.env.JWT_SECRET || '');
      } catch (err) {
        if (err instanceof TokenExpiredError) code = 'expired_token';
      }
      return NextResponse.json(
        {
          success: false,
          code,
          error: code === 'expired_token'
            ? 'Verification link has expired. Enter your email below to receive a new one.'
            : 'This verification link is invalid. Enter your email below to receive a new one.'
        },
        { status: 400 }
      );
    }

    // Verify email
    const success = await UserService.verifyEmail(payload.userId);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to verify email' },
        { status: 500 }
      );
    }

    // Get user details for notifications
    const user = await UserService.getUserById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Move referral earnings to main balance if user was referred
    try {
      await UserService.moveReferralEarningsToMainBalance(payload.userId);
      
      // Process referral bonus for the referrer
      if (user.referredBy) {
        const referrer = await UserService.getUserById(user.referredBy);
        if (referrer) {
          const bonusAmount = 50; // $50 referral bonus
          await NotificationService.processReferralBonus(
            referrer._id?.toString() || '',
            bonusAmount,
            user.userCode || ''
          );
        }
      }
    } catch (error) {
      console.error('Error processing referral earnings:', error);
      // Don't fail the verification if this fails
    }

    // Send notification to user about email verification
    await NotificationService.createNotification({
      title: 'Email Verified Successfully',
      message: 'Your email has been verified successfully. You can now make deposits and access all features.',
      type: 'individual',
      recipients: [payload.userId],
      sentBy: 'system'
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      // Surface the source so the client can show a useful hint if the
      // link only verified because the DB matched a pre-rotation token.
      via: usedFallback ? 'db-fallback' : 'jwt'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Email verification failed' 
      },
      { status: 500 }
    );
  }
}
