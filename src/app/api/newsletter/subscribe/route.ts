import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { rateLimit } from '@/lib/rate-limit';

/**
 * Public by design. Rate limited because this is an open write to the
 * subscribers list: without a limit, anyone can inflate the list and then
 * hand it to the newsletter sender.
 */
const limit = rateLimit({
    scope: 'newsletter-subscribe',
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: 'Too many subscription attempts. Please try again later.'
});

export async function POST(req: NextRequest) {
    try {
        const limited = limit(req);
        if (limited) return limited;

        const { email } = await req.json();

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        const db = await getDb();

        // Check if email already exists
        const existingSubscriber = await db.collection('subscribers').findOne({ email });

        if (existingSubscriber) {
            return NextResponse.json(
                { message: 'You are already subscribed!' },
                { status: 200 }
            );
        }

        await db.collection('subscribers').insertOne({
            email,
            subscribedAt: new Date(),
            active: true
        });

        return NextResponse.json(
            { message: 'Successfully subscribed to newsletter!' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json(
            { error: 'Failed to subscribe. Please try again later.' },
            { status: 500 }
        );
    }
}
