import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/middleware/auth';

/**
 * Submit KYC documents.
 *
 * Was unauthenticated and took the target user from the request body, so an
 * anonymous caller could overwrite any user's identity documents. The user is
 * now taken from the verified session only.
 */
export const POST = requireAuth(async (req, context) => {
    try {
        const { documents } = await req.json();
        const userId = req.user!.id;

        if (!documents || !documents.idFront || !documents.idBack || !documents.selfie) {
            return NextResponse.json({ success: false, error: 'Missing required data' }, { status: 400 });
        }

        const db = await getDb();
        const usersCollection = db.collection('users');

        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    kycStatus: 'pending',
                    kycDocuments: documents,
                    updatedAt: new Date(),
                },
                $push: {
                    activityLog: {
                        action: 'KYC documents submitted',
                        timestamp: new Date().toISOString()
                    }
                } as any
            }
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json({ success: false, error: 'User not found or update failed' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'KYC documents submitted successfully' });
    } catch (error) {
        console.error('KYC API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
});
