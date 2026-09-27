import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/middleware/auth';

/**
 * Admin-only. These handlers were previously unauthenticated, which meant any
 * visitor could rewrite or delete customer testimonials that are rendered on the
 * public site.
 */
export const PUT = requireAdmin(async (req, context) => {
  try {
    const { id } = await context.params;
    const data = await req.json();
    const db = await getDb();

    const result = await db.collection('testimonials').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
          rating: data.rating ? parseFloat(data.rating.toString()) : undefined
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Testimonial not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Testimonial updated' });
  } catch (error) {
    console.error('Testimonial PUT error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (req, context) => {
  try {
    const { id } = await context.params;
    const db = await getDb();

    const result = await db.collection('testimonials').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Testimonial not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    console.error('Testimonial DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});
