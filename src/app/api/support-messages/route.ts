import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { requireAuth } from '@/middleware/auth';

export const POST = requireAuth(async (request, context) => {
  try {
    const { subject, message, priority = 'normal' } = await request.json();
    const userId = request.user!.id;
    const userEmail = request.user!.email;

    if (!subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const supportMessagesCollection = db.collection('supportMessages');

    const supportMessage = {
      userId,
      userEmail,
      subject,
      message,
      priority,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      adminReplies: []
    };

    const result = await supportMessagesCollection.insertOne(supportMessage);

    // Also create a notification for admins
    const notificationsCollection = db.collection('notifications');
    await notificationsCollection.insertOne({
      title: `New Support Request: ${subject}`,
      message: `From: ${userEmail}\n\nSubject: ${subject}\n\nMessage: ${message}`,
      type: 'admin-only',
      recipients: 'all', // Will be filtered to admins
      sentBy: 'system',
      metadata: {
        supportMessageId: result.insertedId.toString(),
        userId,
        userEmail,
        priority
      },
      sentAt: new Date(),
      read: false
    });

    return NextResponse.json({
      success: true,
      message: 'Support message sent successfully',
      data: { id: result.insertedId }
    });
  } catch (error) {
    console.error('Error creating support message:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
});

export const GET = requireAuth(async (request, context) => {
  try {
    const userId = request.user!.id;
    const db = await getDb();
    const supportMessagesCollection = db.collection('supportMessages');

    const messages = await supportMessagesCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching support messages:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
});
