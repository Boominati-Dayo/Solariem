import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import RecoveryCase from '@/lib/models/RecoveryCase';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/middleware/auth';

/** Admin-only. Previously used a hand-rolled cookie check that ignored the Authorization header; now on the shared wrapper. */
export const GET = requireAdmin(async (request, context) => {
  try {
    await dbConnect();
    const cases = await RecoveryCase.find({}).sort({ createdAt: -1 });

    const db = await getDb();
    const usersCollection = db.collection('users');

    const userIds = [...new Set(cases.map(c => c.userId?.toString()).filter(Boolean))];
    const userDocs = await usersCollection.find({
      _id: { $in: userIds.map(id => new ObjectId(id)) }
    }).toArray();

    const userMap: Record<string, any> = {};
    userDocs.forEach(u => {
      userMap[u._id.toString()] = {
        _id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email
      };
    });

    const casesWithUsers = cases.map(c => {
      const caseObj = c.toObject();
      if (caseObj.userId && userMap[caseObj.userId.toString()]) {
        caseObj.userId = userMap[caseObj.userId.toString()];
      }
      return caseObj;
    });

    return NextResponse.json({ success: true, data: casesWithUsers });
  } catch (error: any) {
    console.error('Error in GET /api/admin/recovery:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
});
