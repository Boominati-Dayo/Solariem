import { NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth';
import { UserService } from '@/lib/auth/user';

export const GET = requireAuth(async (request, context) => {
  try {
    const userId = request.user!.id;
    const user = await UserService.getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const referralLink = await UserService.generateReferralLink(user.userCode);

    return NextResponse.json({
      success: true,
      data: {
        referralCode: user.userCode,
        referralLink,
        totalReferrals: 0, // Will be calculated from stats
        totalEarnings: user.referralEarnings || 0
      }
    });

  } catch (error) {
    console.error('Get referral link error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get referral link' 
      },
      { status: 500 }
    );
  }
});
