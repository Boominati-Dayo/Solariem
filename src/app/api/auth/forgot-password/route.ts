import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/auth/user';
import { sendEmail } from '@/lib/email';
import { APP_URL } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Request password reset
    const resetToken = await UserService.requestPasswordReset(email.toLowerCase());

    if (!resetToken) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Send password reset email
    try {
      const resetUrl = `${APP_URL}/reset-password/${resetToken}`;

      await sendEmail({
        to: email,
        subject: 'Reset Your Password - Solariem',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Password Reset Request</h2>
            <p>You requested a password reset for your Solariem account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">© 2024 Solariem. All rights reserved.</p>
          </div>
        `,
        text: `Password Reset Request

You requested a password reset for your Solariem account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.

© 2024 Solariem. All rights reserved.`
      });

      console.log('Password reset email sent successfully to:', email);

    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Still return success for security - don't reveal if email sending failed
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Password reset request failed'
      },
      { status: 500 }
    );
  }
}
