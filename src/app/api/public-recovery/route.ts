import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import RecoveryCase from '@/lib/models/RecoveryCase';
import { sendEmail, emailTemplates } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';

/**
 * Public lead-capture: the recovery report form posts here without a session.
 *
 * Rate limited per IP. It sends a confirmation to a caller-supplied address
 * and an alert to the admin inbox, so unbounded it is both a mail relay for
 * third parties and a way to flood the admin queue.
 */

const limit = rateLimit({
    scope: 'public-recovery',
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: 'Too many reports submitted. If you need to send more than one, please email us.'
});

function generateClaimNumber() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomPart = '';
    for (let i = 0; i < 8; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `REC-${new Date().getFullYear()}-${randomPart}`;
}

export async function POST(request: NextRequest) {
    try {
        const limited = limit(request);
        if (limited) return limited;

        const body = await request.json();
        const {
            firstName,
            lastName,
            email,
            phone,
            address,
            scamType,
            amountLost,
            currency,
            dateOfIncident,
            platformName,
            details,
            screenshotUrl
        } = body;

        if (!firstName || !lastName || !email || !scamType || !amountLost || !platformName) {
            return NextResponse.json({ success: false, error: 'Missing critical information' }, { status: 400 });
        }

        await dbConnect();

        const claimNumber = generateClaimNumber();

        const newCase = new RecoveryCase({
            claimNumber,
            isPublic: true,
            email,
            phone,
            address,
            scamType,
            amountLost: parseFloat(amountLost),
            currency: currency || 'USD',
            dateOfIncident,
            platformName,
            details,
            screenshotUrl,
            status: 'pending',
            updates: [{
                status: 'pending',
                message: 'Forensic briefing transmitted and received by the registry.',
                timestamp: new Date()
            }]
        });

        await newCase.save();

        // Send confirmation email to user
        const fullName = `${firstName} ${lastName}`;
        const userEmailOptions = emailTemplates.recoveryClaimConfirmation(fullName, claimNumber, scamType);
        await sendEmail({
            to: email,
            ...userEmailOptions
        });

        // Send alert email to admin
        const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
        if (adminEmail) {
            const adminOptions = emailTemplates.recoveryClaimAdminAlert(email, claimNumber, scamType, parseFloat(amountLost), currency || 'USD');
            await sendEmail({
                to: adminEmail,
                ...adminOptions
            });
        }

        return NextResponse.json({ success: true, data: { claimNumber } });
    } catch (error) {
        console.error('Public recovery submission error:', error);
        return NextResponse.json({ success: false, error: 'We could not send your report. Please try again.' }, { status: 500 });
    }
}
