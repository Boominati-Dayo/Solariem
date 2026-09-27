import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';

import { requireAuth, type AuthenticatedRequest } from '@/middleware/auth';
import RecoveryCase from '@/lib/models/RecoveryCase';
import { ObjectId } from 'mongodb';

export const GET = requireAuth(async (request: AuthenticatedRequest) => {
  try {
    await dbConnect();

    const cases = await RecoveryCase.find({ userId: new ObjectId(request.user!.id) }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: cases });
  } catch (error) {
    console.error('Recovery list error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
});

function generateClaimNumber() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 8; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `REC-${new Date().getFullYear()}-${randomPart}`;
}

export const POST = requireAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { scamType, amountLost, dateOfIncident, platformName, details } = body;

    if (!scamType || !amountLost || !dateOfIncident || !platformName || !details) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const claimNumber = generateClaimNumber();

    const newCase = new RecoveryCase({
      userId: new ObjectId(request.user!.id),
      claimNumber,
      isPublic: false,
      scamType,
      amountLost: parseFloat(amountLost),
      dateOfIncident,
      platformName,
      details,
      status: 'pending',
      updates: [{
        status: 'pending',
        message: 'Case initialized and awaiting officer assignment.',
        timestamp: new Date()
      }]
    });

    await newCase.save();

    return NextResponse.json({ success: true, data: newCase });
  } catch (error) {
    console.error('Recovery submission error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit report' }, { status: 500 });
  }
});
