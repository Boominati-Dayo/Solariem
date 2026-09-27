import { NextResponse } from 'next/server';
import { requireAdmin, AuthenticatedRequest } from '@/middleware/auth';
import { UserService } from '@/lib/auth/user';

export const GET = requireAdmin(async (request: AuthenticatedRequest, context: any) => {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const userId = pathSegments[pathSegments.length - 1];

    const user = await UserService.getUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Remove sensitive data
    const { password: _p, emailVerificationToken: _ev, passwordResetToken: _pr, ...userWithoutSensitiveData } = user;

    return NextResponse.json({
      success: true,
      data: userWithoutSensitiveData
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to get user' },
      { status: 500 }
    );
  }
});

export const PUT = requireAdmin(async (request: AuthenticatedRequest, context: any) => {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const userId = pathSegments[pathSegments.length - 1];
    const updates = await request.json();

    const {
      password: _p1,
      email: _e1,
      userCode: _c1,
      _id: _i1,
      ...allowedUpdates
    } = updates;

    // Update user profile
    const success = await UserService.updateUserProfile(userId, allowedUpdates);

    // If email was verified, add to activity log
    if (success && allowedUpdates.emailVerified === true) {
      const { getDb } = await import('@/lib/mongodb');
      const { ObjectId } = await import('mongodb');
      const db = await getDb();
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        {
          $push: {
            activityLog: {
              action: 'Email manually verified by system administrator',
              timestamp: new Date().toISOString()
            }
          } as any
        }
      );
    }

    // If KYC was verified, add to activity log
    if (success && allowedUpdates.kycStatus === 'verified') {
      const { getDb } = await import('@/lib/mongodb');
      const { ObjectId } = await import('mongodb');
      const { NotificationService } = await import('@/lib/notifications/NotificationService');
      const db = await getDb();
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            kycVerifiedAt: new Date()
          },
          $push: {
            activityLog: {
              action: 'KYC manually verified by system administrator',
              timestamp: new Date().toISOString()
            }
          } as any
        }
      );

      // Notify the user
      try {
        const user = await UserService.getUserById(userId);
        if (user && user.email) {
          await NotificationService.notifyKycApproval(userId, user.email);
        }
      } catch (notificationError) {
        console.error('Failed to send manual KYC notification:', notificationError);
      }
    }

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update user' },
        { status: 500 }
      );
    }

    const updatedUser = await UserService.getUserById(userId);
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found after update' },
        { status: 404 }
      );
    }

    // Remove sensitive data from response
    const { password: _p, emailVerificationToken: _ev, passwordResetToken: _pr, ...userWithoutSensitiveData } = updatedUser;

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: userWithoutSensitiveData
      }
    });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
});

export const DELETE = requireAdmin(async (request: AuthenticatedRequest, context: any) => {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const userId = pathSegments[pathSegments.length - 1];

    // Delete user
    const success = await UserService.deleteUser(userId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('User deletion error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
});