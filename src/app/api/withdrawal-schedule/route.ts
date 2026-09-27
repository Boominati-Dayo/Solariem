import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { requireAuth } from '@/middleware/auth';

/**
 * The withdrawal window is a policy setting, not user data, but it gates
 * whether a signed-in user can submit a withdrawal at all. Sign-in required.
 */
export const GET = requireAuth(async () => {
  try {
    const db = await getDb();
    const scheduleCollection = db.collection('withdrawalSchedule');

    const schedule = await scheduleCollection.findOne({ type: 'withdrawal_schedule' });

    return NextResponse.json({
      success: true,
      data: schedule || {
        enabled: false,
        allowedDays: [],
        allowedTimes: {
          start: '09:00',
          end: '17:00'
        },
        timezone: 'UTC'
      }
    });
  } catch (error) {
    console.error('Get withdrawal schedule error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to get withdrawal schedule' },
      { status: 500 }
    );
  }
});
