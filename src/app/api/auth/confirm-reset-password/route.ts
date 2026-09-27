import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/auth/user';
import { validatePassword } from '@/lib/auth/password';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: passwordValidation.errors.join(', ') || 'Password validation failed'
        },
        { status: 400 }
      );
    }

    // Reset password
    const success = await UserService.resetPassword(token, password);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Confirm reset password error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Password reset failed' 
      },
      { status: 500 }
    );
  }
}

