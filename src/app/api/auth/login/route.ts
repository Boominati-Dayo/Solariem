import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/auth/user';
// import { NotificationService } from '@/lib/notifications/NotificationService';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const result = await UserService.authenticateUser(email.toLowerCase(), password);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!result.user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Remove sensitive data from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, emailVerificationToken: _emailToken, passwordResetToken: _resetToken, transactionPin: _pin, kycDocuments: _kycDocs, activityLog: _activityLog, ...userWithoutSensitiveData } = result.user;

    // Set httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutSensitiveData,
        token: result.token
      }
    });

    // Set secure httpOnly cookie
    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      },
      { status: 500 }
    );
  }
}
