import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { UserService } from '@/lib/auth/user';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await UserService.getUserById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is deactivated' },
        { status: 403 }
      );
    }

    // Remove sensitive data from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, emailVerificationToken: _emailToken, passwordResetToken: _resetToken, transactionPin: _pin, kycDocuments: _kycDocs, activityLog: _activityLog, ...userWithoutSensitiveData } = user;

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutSensitiveData
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user'
      },
      { status: 500 }
    );
  }
}
