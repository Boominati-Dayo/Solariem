import { NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserService } from '@/lib/auth/user';
import { hashPin, validatePin, verifyTransactionPin } from '@/lib/auth/pin';

export const POST = requireAuth(async (request: AuthenticatedRequest, context: any) => {
  try {
    const { currentPin, newPin } = await request.json();

    if (!currentPin || !validatePin(currentPin)) {
      return NextResponse.json(
        { success: false, error: 'Current PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    if (!newPin || !validatePin(newPin)) {
      return NextResponse.json(
        { success: false, error: 'New PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    const user = await UserService.getUserById(request.user!.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const isValid = await verifyTransactionPin(currentPin, user.transactionPin);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Current PIN is incorrect' },
        { status: 401 }
      );
    }

    const hashedPin = await hashPin(newPin);
    const updated = await UserService.updateUserProfile(request.user!.id, {
      transactionPin: hashedPin
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Failed to update PIN' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction PIN updated successfully'
    });
  } catch (error) {
    console.error('Change PIN error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to change PIN' },
      { status: 500 }
    );
  }
});
