import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import RecoveryCase from '@/lib/models/RecoveryCase';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * Public case tracking.
 *
 * SECURITY: this endpoint is unauthenticated — the only factors are an email
 * address and a claim number, both of which travel in the query string. Two
 * consequences, both handled here:
 *
 *   1. Only the fields a client is entitled to see are returned. `adminNotes`,
 *      `serviceFee`, `unblockFee`, `screenshotUrl`, `details`, `phone` and
 *      `address` are internal and are explicitly excluded.
 *   2. Every failure returns the same message. Distinguishing "no such claim"
 *      from "wrong email" would turn this into an enumeration oracle for
 *      claim numbers, so the 404 and 403 paths are deliberately identical.
 */

const PUBLIC_FIELDS = [
  'claimNumber',
  'scamType',
  'amountLost',
  'currency',
  'dateOfIncident',
  'status',
  'amountClaimed',
  'updates',
  'createdAt',
  'updatedAt',
].join(' ');

const NOT_FOUND = {
  success: false,
  error: 'We could not find a case matching those details. Check both and try again.',
};

type PublicCase = {
  claimNumber?: string;
  email?: string;
  userId?: unknown;
  scamType?: string;
  amountLost?: number;
  currency?: string;
  dateOfIncident?: string;
  status?: string;
  amountClaimed?: number;
  updates?: { status: string; message: string; timestamp: Date }[];
  createdAt: Date;
  updatedAt: Date;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const claimNumber = searchParams.get('claimNumber');

    if (!email || !claimNumber) {
      return NextResponse.json(
        { success: false, error: 'Enter both the email address and the case reference.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const query = { claimNumber: claimNumber.trim().toUpperCase() };
    const caseData = (await RecoveryCase.findOne(query)
      .select(PUBLIC_FIELDS)
      .lean()) as PublicCase | null;

    if (!caseData) {
      return NextResponse.json(NOT_FOUND, { status: 404 });
    }

    // Cases raised from inside the dashboard may have no email on the record,
    // so fall back to the email on the linked user account.
    if (caseData.email) {
      if (caseData.email.toLowerCase() !== email.trim().toLowerCase()) {
        return NextResponse.json(NOT_FOUND, { status: 404 });
      }
    } else {
      let userEmail: string | null = null;

      if (caseData.userId) {
        const db = await getDb();
        const user = await db
          .collection('users')
          .findOne({ _id: new ObjectId(String(caseData.userId)) });
        userEmail = user?.email ?? null;
      }

      if (!userEmail || userEmail.toLowerCase() !== email.trim().toLowerCase()) {
        return NextResponse.json(NOT_FOUND, { status: 404 });
      }
    }

    return NextResponse.json({ success: true, data: caseData });
  } catch (error) {
    console.error('Tracking API error:', error);
    return NextResponse.json(
      { success: false, error: 'We could not check that just now. Please try again.' },
      { status: 500 }
    );
  }
}
