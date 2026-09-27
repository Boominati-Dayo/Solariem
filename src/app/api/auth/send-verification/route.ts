import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '@/lib/email';
import { UserService } from '@/lib/auth/user';
import { generateEmailVerificationToken } from '@/lib/auth/jwt';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { SITE_URL } from '@/lib/site';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await UserService.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      );
    }

    // If user is already verified, no need to send another link
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'This email is already verified. Please log in.' },
        { status: 200 }
      );
    }

    // Make sure the user has a valid verification token; regenerate if missing
    let token = user.emailVerificationToken;
    if (!token) {
      token = generateEmailVerificationToken(user._id!.toString());
      const db = await getDb();
      await db.collection('users').updateOne(
        { _id: new ObjectId(user._id!.toString()) },
        {
          $set: {
            emailVerificationToken: token,
            emailVerificationExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
          },
        }
      );
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || SITE_URL}/verify-email?token=${token}`;
    const template = emailTemplates.emailVerification(user.firstName, verificationUrl);

    // Send email
    await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    return NextResponse.json(
      { message: 'Verification email sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Send verification email error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}









