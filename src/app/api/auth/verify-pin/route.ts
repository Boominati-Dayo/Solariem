import { NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserService } from '@/lib/auth/user';
import { validatePin, verifyTransactionPin } from '@/lib/auth/pin';

export const POST = requireAuth(async (request: AuthenticatedRequest, context: any) => {
  try {
    const { pin } = await request.json();

    if (!pin || !validatePin(pin)) {
      return NextResponse.json(
        { success: false, error: 'PIN must be exactly 4 digits' },
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

    const isValid = await verifyTransactionPin(pin, user.transactionPin);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Incorrect transaction PIN. Please try again.' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify PIN error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify PIN' },
      { status: 500 }
    );
  }
});
