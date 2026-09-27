import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/middleware/auth';

/**
 * Fetch one deposit or withdrawal request.
 *
 * Was unauthenticated, so any caller who learned or guessed a 24-character id
 * could read another user's transaction, including the destination bank and
 * wallet details. Scoped to the owner, with an admin bypass.
 */
export const GET = requireAuth(async (request, context) => {
  try {
    const db = await getDb();
    const { id } = await context.params;

    if (!id || !/^[a-f0-9]{24}$/i.test(id)) {
      return NextResponse.json({ success: false, error: 'Invalid transaction ID' }, { status: 400 });
    }

    const objectId = new ObjectId(id);

    // Try deposits first, then withdrawals.
    let transaction = await db.collection('depositRequests').findOne({ _id: objectId });
    if (!transaction) {
      transaction = await db.collection('withdrawalRequests').findOne({ _id: objectId });
    }

    if (!transaction) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    if (!request.user!.isAdmin && String(transaction.userId) !== request.user!.id) {
      // Same response as a genuine miss, so this cannot be used to probe for ids.
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error fetching single transaction:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});
