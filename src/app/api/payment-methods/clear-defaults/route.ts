import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { requireAdmin } from '@/middleware/auth';

/**
 * Destructive maintenance endpoint: wipes the entire paymentMethods collection.
 * Admin-only. Everything else in the collection is reachable through the
 * admin CRUD handlers on /api/payment-methods.
 */
export const POST = requireAdmin(async () => {
  try {
    const db = await getDb();

    const result = await db.collection('paymentMethods').deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Cleared ${result.deletedCount} payment methods`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing payment methods:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});
