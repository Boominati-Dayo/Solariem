import { NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserService } from '@/lib/auth/user';

export const POST = requireAuth(async (request: AuthenticatedRequest, context: any) => {
  try {
    const { email, userCode } = await request.json();

    if (!email || !userCode) {
      return NextResponse.json(
        { success: false, error: 'Email and user code are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await UserService.getUserByEmail(email.toLowerCase());

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No user found with this email address' },
        { status: 404 }
      );
    }

    // Verify user code matches
    if (user.userCode !== userCode) {
      return NextResponse.json(
        { success: false, error: 'Email and user code do not match. Please verify the details.' },
        { status: 400 }
      );
    }

    // Check if user is trying to transfer to themselves
    if (user._id === request.user!.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot transfer money to yourself' },
        { status: 400 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'This user account is deactivated' },
        { status: 400 }
      );
    }

    // Return user info (without sensitive data)
    const { password: _, emailVerificationToken: __, passwordResetToken: ___, transactionPin: ____, ...userInfo } = user;

    return NextResponse.json({
      success: true,
      data: {
        user: userInfo
      }
    });

  } catch (error) {
    console.error('User lookup error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
});
