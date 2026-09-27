import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { sendEmail } from '@/lib/email';
import { requireAdmin } from '@/middleware/auth';

/**
 * Admin-only. This was previously an open mail relay: the file carried a
 * comment saying "Ideally, check if user is admin" and no check at all, so any
 * unauthenticated caller could send arbitrary HTML to every subscriber on the
 * list. The subject and body are taken straight from the request.
 */
export const POST = requireAdmin(async (req, context) => {
    try {
        const { subject, message } = await req.json();

        if (!subject || !message) {
            return NextResponse.json(
                { error: 'Subject and message are required' },
                { status: 400 }
            );
        }

        // Only text or a known-safe subset is acceptable in a bulk send.
        if (/<script|on\w+\s*=|javascript:/i.test(`${subject}${message}`)) {
            return NextResponse.json(
                { error: 'Message contains disallowed markup' },
                { status: 400 }
            );
        }

        const db = await getDb();

        // Get all active subscribers
        const subscribers = await db.collection('subscribers').find({ active: true }).toArray();

        if (subscribers.length === 0) {
            return NextResponse.json(
                { message: 'No active subscribers found.' },
                { status: 400 }
            );
        }

        // Send emails in batches or individually
        // For simplicity and better deliverability tracking, we'll loop.
        // In production with many users, use a queue or bulk send service.

        let successCount = 0;
        let failCount = 0;

        for (const subscriber of subscribers) {
            try {
                await sendEmail({
                    to: subscriber.email,
                    subject: subject,
                    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              ${message}
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">
                You are receiving this email because you subscribed to the Solariem newsletter.
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${subscriber.email}">Unsubscribe</a>
              </p>
            </div>
          `,
                    text: message // Ideally strip HTML for text version
                });
                successCount++;
            } catch (error) {
                console.error(`Failed to send newsletter to ${subscriber.email}:`, error);
                failCount++;
            }
        }

        return NextResponse.json(
            {
                success: true,
                message: `Newsletter sent successfully. Sent: ${successCount}, Failed: ${failCount}`
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Newsletter sending error:', error);
        return NextResponse.json(
            { error: 'Failed to send newsletter.' },
            { status: 500 }
        );
    }
});
