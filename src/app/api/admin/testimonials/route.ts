import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/middleware/auth';

/**
 * Admin-only. These handlers were previously unauthenticated, which meant any
 * visitor could publish arbitrary customer testimonials to the public site.
 * Testimonials are rendered on the homepage, so this is also a content-integrity
 * issue: it is a defacement vector as much as a data-exposure one.
 */
export const GET = requireAdmin(async (req, context) => {
  try {
    const db = await getDb();
    const testimonials = await db.collection('testimonials').find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, data: testimonials });
  } catch (error) {
    console.error('Testimonials GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = requireAdmin(async (req, context) => {
  try {
    const data = await req.json();
    const { name, content, rating, picture } = data;

    if (!name || !content || !rating || !picture) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('testimonials').insertOne({
      name,
      content,
      rating: parseFloat(rating),
      picture,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Testimonials POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});
