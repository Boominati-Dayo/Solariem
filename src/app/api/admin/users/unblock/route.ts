import { NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const POST = requireAdmin(async (request, context) => {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        const db = await getDb();
        const usersCollection = db.collection('users');

        // Get user
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        if (!user.isAccountBlocked && !user.isAccountRestricted) {
            return NextResponse.json({ success: false, error: 'User account is not blocked or restricted' }, { status: 400 });
        }

        const { processAccountUnblock } = await import('@/lib/admin/unblockUtils');
        const result = await processAccountUnblock(db, userId, 'admin');

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.message }, { status: 400 });
        }

        // Get updated user to return balances
        const updatedUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });

        return NextResponse.json({
            success: true,
            message: 'User account unblocked and protocol documented',
            data: {
                balances: {
                    main: updatedUser?.balances?.main || 0,
                    referral: updatedUser?.balances?.referral || 0,
                    total: updatedUser?.balances?.total || 0
                }
            }
        });

    } catch (error) {
        console.error('Error unblocking user:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' },
            { status: 500 }
        );
    }
});
