import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';

/**
 * Public contact form. Sends mail to the admin inbox on behalf of whoever
 * calls it, so it is rate limited per IP.
 *
 * Caller-supplied values are escaped before going into the HTML body. They
 * arrive from an anonymous form, so without this anyone could inject markup
 * or a tracking image into our own outbound mail.
 */

const limit = rateLimit({
  scope: 'contact',
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many messages sent. Please try again later.'
});

const MAX_NAME = 120;
const MAX_MESSAGE = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Escape the five characters that can break out of HTML text or an attribute. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export async function POST(request: NextRequest) {
  try {
    const limited = limit(request);
    if (limited) return limited;

    const body = await request.json();

    const name = asString(body.name).trim().slice(0, MAX_NAME);
    const email = asString(body.email).trim().slice(0, 254);
    const message = asString(body.message).trim().slice(0, MAX_MESSAGE);
    const scamType = asString(body.scamType).trim().slice(0, MAX_NAME);
    const amount = asString(body.amount).trim().slice(0, MAX_NAME);

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { success: false, error: 'That email address does not look right' },
        { status: 400 }
      );
    }

    // Single-line values go into the subject, so collapse any newlines that
    // could otherwise be used to inject extra headers.
    const subject = `Web enquiry: ${scamType.replace(/[\r\n]+/g, ' ') || 'general'} - from ${name.replace(/[\r\n]+/g, ' ')}`;

    const emailText = [
      'New website enquiry',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Type of fraud: ${scamType || 'not stated'}`,
      `Amount, if stated: ${amount || 'not stated'}`,
      '',
      'Message:',
      message,
      '',
      'Sent via the contact form on the Solariem website.'
    ].join('\n');

    const emailHtml = `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #14130F; border-bottom: 2px solid #0E5A50; padding-bottom: 10px;">New website enquiry</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Type of fraud:</strong> ${escapeHtml(scamType || 'not stated')}</p>
        <p><strong>Amount, if stated:</strong> ${escapeHtml(amount || 'not stated')}</p>
        <div style="background: #f4f4f4; padding: 15px; border-left: 2px solid #0E5A50; margin-top: 10px;">
          <strong>Message:</strong><br/>
          ${escapeHtml(message).replace(/\n/g, '<br/>')}
        </div>
        <p style="font-size: 12px; color: #777; margin-top: 20px;">Sent via the contact form on the Solariem website.</p>
      </div>
    `;

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (!adminEmail) {
      console.error('Contact form: no ADMIN_EMAIL or SMTP_USER configured');
      return NextResponse.json(
        { success: false, error: 'The message could not be sent. Please try again shortly.' },
        { status: 500 }
      );
    }

    await sendEmail({ to: adminEmail, subject, text: emailText, html: emailHtml });

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent. We will reply by email.'
    });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { success: false, error: 'The message could not be sent. Please try again shortly.' },
      { status: 500 }
    );
  }
}
