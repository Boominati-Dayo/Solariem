import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/middleware/auth';

/**
 * Download a stored file.
 *
 * This was unauthenticated, which turned an enumerable ObjectId into a way to
 * download anyone's KYC document images, deposit screenshots and admin
 * attachments. Access is now owner-or-admin: the document's own metadata decides
 * which user it belongs to, and the caller's id is compared against it.
 */
export const GET = requireAuth(async (request, context) => {
  try {
    const { id } = await context.params;
    const db = await getDb();
    const bucket = db.collection('notification_files');

    if (!id || !/^[a-f0-9]{24}$/i.test(id)) {
      return NextResponse.json({ success: false, error: 'Invalid file ID' }, { status: 400 });
    }

    const file = await bucket.findOne({ _id: new ObjectId(id) });

    if (!file) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    if (!request.user!.isAdmin) {
      // Accept either shape the uploader recorded: an explicit `userId` or a
      // single-element `recipients` array.
      const owner = file.userId ?? (Array.isArray(file.recipients) ? file.recipients[0] : undefined);
      if (!owner || String(owner) !== request.user!.id) {
        return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
      }
    }

    return new NextResponse(file.buffer, {
      headers: {
        'Content-Type': file.contentType,
        'Content-Disposition': `attachment; filename="${file.originalName}"`,
        'Content-Length': file.size.toString(),
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('Error retrieving file:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to retrieve the file' },
      { status: 500 }
    );
  }
});
