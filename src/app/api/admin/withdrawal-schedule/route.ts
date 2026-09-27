import { NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/auth';
import { getDb } from '@/lib/mongodb';

export const GET = requireAdmin(async (_request, _context) => {
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

export const POST = requireAdmin(async (request, context) => {
  try {
    const { enabled, allowedDays, allowedTimes, timezone } = await request.json();
    
    if (!Array.isArray(allowedDays) || allowedDays.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one day must be selected' },
        { status: 400 }
      );
    }
    
    if (!allowedTimes.start || !allowedTimes.end) {
      return NextResponse.json(
        { success: false, error: 'Start and end times are required' },
        { status: 400 }
      );
    }
    
    const db = await getDb();
    const scheduleCollection = db.collection('withdrawalSchedule');
    
    const scheduleData = {
      type: 'withdrawal_schedule',
      enabled,
      allowedDays,
      allowedTimes,
      timezone: timezone || 'UTC',
      updatedAt: new Date(),
      updatedBy: request.user!.id
    };
    
    await scheduleCollection.replaceOne(
      { type: 'withdrawal_schedule' },
      scheduleData,
      { upsert: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Withdrawal schedule updated successfully'
    });
  } catch (error) {
    console.error('Update withdrawal schedule error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update withdrawal schedule' },
      { status: 500 }
    );
  }
});
