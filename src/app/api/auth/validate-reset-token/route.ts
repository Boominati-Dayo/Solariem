import { NextRequest, NextResponse } from 'next/server';
import { verifyPasswordResetToken } from '@/lib/auth/jwt';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify token format first
    const decoded = verifyPasswordResetToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Verify token exists in database and is not expired
    const db = await getDb();
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Token is valid'
    });

  } catch (error) {
    console.error('Validate reset token error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to validate token' 
      },
      { status: 500 }
    );
  }
}

