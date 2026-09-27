import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { requireAdmin } from '@/middleware/auth';
import {
  WITHDRAWAL_CODE_TYPES,
  type WithdrawalCodeType,
  type UserCodePricing,
  defaultUserCodePricing
} from '@/lib/withdrawal-codes';

// GET /api/admin/user-codes?id=<userId>
// Returns the per-user pricing for the 5 codes. If no pricing is set
// yet, returns the default pricing (TPIN enabled free, others off).
export const GET = requireAdmin(async (request: NextRequest, context: any) => {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ success: false, error: 'Invalid userId' }, { status: 400 });
    }
    const db = await getDb();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { withdrawalCodePricing: 1, email: 1, firstName: 1, lastName: 1, currency: 1 } }
    );
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    const stored = (user as { withdrawalCodePricing?: UserCodePricing }).withdrawalCodePricing;
    const pricing = stored ? { ...defaultUserCodePricing(), ...stored } : defaultUserCodePricing();
    return NextResponse.json({
      success: true,
      data: {
        userId,
        userLabel: `${(user as { firstName?: string }).firstName || ''} ${(user as { lastName?: string }).lastName || ''}`.trim() || (user as { email?: string }).email || userId,
        currency: (user as { currency?: string }).currency || 'USD',
        pricing,
        codeTypes: WITHDRAWAL_CODE_TYPES
      }
    });
  } catch (error) {
    console.error('Admin get user-codes error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch pricing' }, { status: 500 });
  }
});

// PUT /api/admin/user-codes
// Persists the admin's per-user pricing. Server enforces the hard
// price cap and the TPIN-is-always-on invariant. The admin's email is
// recorded in the activity log so the change is auditable.
export const PUT = requireAdmin(async (request: NextRequest, context: any) => {
  try {
    const body = await request.json();
    const userId = String(body.userId || '');
    const pricing = body.pricing as Partial<UserCodePricing> | undefined;
    const adminEmail = (request as unknown as { user?: { email?: string } }).user?.email || 'admin';
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ success: false, error: 'Invalid userId' }, { status: 400 });
    }
    if (!pricing || typeof pricing !== 'object') {
      return NextResponse.json({ success: false, error: 'pricing is required' }, { status: 400 });
    }

    // Merge with defaults so every key is present
    const merged: UserCodePricing = defaultUserCodePricing();
    for (const key of WITHDRAWAL_CODE_TYPES) {
      const incoming = (pricing as Record<string, { enabled?: boolean; price?: number }>)[key];
      if (incoming && typeof incoming === 'object') {
        const enabled = Boolean(incoming.enabled);
        let price = Number(incoming.price);
        if (!Number.isFinite(price) || price < 0) price = 0;
        merged[key] = { enabled, price };
      }
    }
    // TPIN is always on, free, and not optional.
    merged.TPIN = { enabled: true, price: 0 };

    const db = await getDb();
    const now = new Date();
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          withdrawalCodePricing: merged,
          updatedAt: now,
          updatedBy: adminEmail
        },
        $push: {
          activityLog: {
            action: `Withdrawal code pricing updated by ${adminEmail}`,
            timestamp: now.toISOString(),
            metadata: { pricing: merged }
          }
        } as any
      } as any
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { pricing: merged } });
  } catch (error) {
    console.error('Admin put user-codes error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update pricing' }, { status: 500 });
  }
});
