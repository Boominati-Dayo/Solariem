import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    const testimonials = await db.collection('testimonials').find({ isActive: true }).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, data: testimonials });
  } catch (error) {
    console.error('Public Testimonials GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
