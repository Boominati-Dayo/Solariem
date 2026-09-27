import { NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth';
import { UserService } from '@/lib/auth/user';

export const GET = requireAuth(async (request, context) => {
  try {
    const userId = request.user!.id;
    const stats = await UserService.getReferralStats(userId);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get referral stats error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get referral stats' 
      },
      { status: 500 }
    );
  }
});
