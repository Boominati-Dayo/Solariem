import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { requireAuth } from '@/middleware/auth';

export const GET = requireAuth(async (request, context) => {
    try {
        const userId = request.user!.id;
        const db = await getDb();

        const deposits = await db.collection('depositRequests')
            .find({ userId }, { projection: { screenshot: 0 } })
            .sort({ createdAt: -1 })
            .limit(100)
            .toArray();

        // Fetch payment methods to resolve details if needed
        const paymentMethods = await db.collection('paymentMethods').find({}).toArray();
        const pmMap = paymentMethods.reduce((acc, pm) => ({
            ...acc,
            [pm._id.toString()]: pm
        }), {} as any);

        const enrichedDeposits = deposits.map(d => ({
            ...d,
            paymentMethod: pmMap[d.paymentMethodId] || null
        }));

        return NextResponse.json({ success: true, data: enrichedDeposits });
    } catch (error) {
        console.error('Error fetching user deposits:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch deposits' }, { status: 500 });
    }
});
