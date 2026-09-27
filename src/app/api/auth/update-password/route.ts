import { NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth';
import { UserService } from '@/lib/auth/user';
import { verifyPassword, hashPassword } from '@/lib/auth/password';

export const POST = requireAuth(async (request, context) => {
  try {
    const { currentPassword, newPassword } = await request.json();
    const userId = request.user!.id;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await UserService.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password in database
    const success = await UserService.updateUserProfile(userId, {
      password: hashedNewPassword
    });

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
});



