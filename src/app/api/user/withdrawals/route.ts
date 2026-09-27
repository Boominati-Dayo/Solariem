import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { requireAuth, type AuthenticatedRequest } from '@/middleware/auth';

// GET /api/user/withdrawals
// Returns the current user's withdrawal requests. Default filter is
// non-terminal (pending/processing). Pass ?status=all for everything.
export const GET = requireAuth(async (request: AuthenticatedRequest, context: any) => {
  try {
    const userId = request.user!.id;
    const url = new URL(request.url);
    const scope = url.searchParams.get('status') || 'open';
    const db = await getDb();

    const filter: Record<string, unknown> = { userId };
    if (scope === 'open') {
      filter.status = { $in: ['pending', 'processing'] };
    }

    const withdrawals = await db.collection('withdrawalRequests')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ success: true, data: withdrawals });
  } catch (error) {
    console.error('Error fetching user withdrawals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch withdrawals' },
      { status: 500 }
    );
  }
});