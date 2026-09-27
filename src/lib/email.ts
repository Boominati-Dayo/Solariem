import nodemailer from 'nodemailer';
import { getCurrencySymbol } from '@/lib/currencies';
import { SITE_URL, ORG } from '@/lib/site';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Create reusable transporter object using the default SMTP transport
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

  // Google displays app passwords as four groups of four ("ghae zrqk wlls
  // hxgn") and it is very easy to paste them with the spaces intact. The space
  // is not part of the credential, so the server sees a 19-character secret
  // where it expects 16 and rejects AUTH with a generic
  // "535 Incorrect login or password". Stripping here means the pasted-as-shown
  // form works, instead of failing with an error that points at the wrong thing.
  const secret = pass ? pass.replace(/\s+/g, '') : pass;

  if (!user || !pass) {
    console.warn('SMTP credentials not found. Emails will not be sent.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass: secret,
    },
  });
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.warn('Email transporter not initialized. Skipping email:', options.subject);
      return;
    }

    // The From: header. Gmail only permits the authenticated address or a
    // verified Workspace alias, so EMAIL_FROM must be set to a real mailbox and
    // falls back to SMTP_USER rather than to the public contact address, which
    // is not a sending identity during the development phase.
    const from = process.env.EMAIL_FROM || `"${ORG.name}" <${process.env.SMTP_USER || ORG.email}>`;

    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Email sending failed:', error);
    // We don't throw here to prevent breaking the flow if email fails
    // But in critical paths, the caller might want to know
  }
};

// Base HTML template wrapper
export const getBaseTemplate = (title: string, content: string, userName?: string) => {
  const year = new Date().getFullYear();
  const appName = ORG.name;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || SITE_URL;
  // The public contact address, so a recipient who wants to verify the sender
  // has a real one to check against. Kept in sync with the site by importing
  // ORG rather than repeating the string in a template.
  const SUPPORT_EMAIL = ORG.email;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        .header {
          background-color: #ffffff;
          padding: 30px;
          text-align: center;
          border-bottom: 1px solid #f3f4f6;
        }
        .logo {
          height: 60px;
          margin-bottom: 20px;
        }
        .content {
          padding: 40px 30px;
        }
        .title {
          font-size: 24px;
          font-weight: 700;
          color: #14130F;
          margin-bottom: 20px;
          text-align: center;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
        }
        .message {
          margin-bottom: 30px;
          color: #4b5563;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          background-color: #0E5A50;
          color: #14130F !important;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          display: inline-block;
          transition: background-color 0.2s;
        }
        .footer {
          background-color: #14130F;
          color: #9ca3af;
          padding: 30px;
          text-align: center;
          font-size: 14px;
        }
        .footer-logo {
          color: #ffffff;
          font-weight: 700;
          font-size: 18px;
          margin-bottom: 15px;
        }
        .footer-links {
          margin: 15px 0;
        }
        .footer-links a {
          color: #9ca3af;
          text-decoration: none;
          margin: 0 10px;
        }
        .social-links {
          margin-top: 20px;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background-color: #F5F4F0;
          border-radius: 8px;
          overflow: hidden;
        }
        .data-table td {
          padding: 12px 15px;
          border-bottom: 1px solid #E6E4DE;
        }
        .data-table td:first-child {
          font-weight: 600;
          color: #4b5563;
          width: 40%;
        }
        .data-table td:last-child {
          text-align: right;
          color: #14130F;
          word-break: break-all;
        }
        .highlight {
          color: #0E5A50;
          font-weight: 700;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="footer-logo">${appName}</div>
        </div>
        
        <div class="content">
          <h1 class="title">${title}</h1>
          <div class="greeting">Hello${userName ? ` ${userName}` : ''},</div>
          <div class="message">
            ${content}
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-logo">${appName}</div>
          <p>Multi-currency accounts, and a team that traces money taken by fraud.</p>
          <div class="footer-links">
            <a href="${appUrl}/dashboard">Dashboard</a> | 
            <a href="${appUrl}/contact">Support</a> | 
            <a href="${appUrl}/terms">Terms of Service</a>
          </div>
          <p>Contact: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
          <p>&copy; ${year} ${appName}. All rights reserved.</p>
          <p style="font-size: 12px; margin-top: 20px;">
            If you did not expect this email, please ignore it, or contact us at
            ${SUPPORT_EMAIL}. We will never ask you for your password, a one-time code,
            or payment to release funds.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email templates
export const emailTemplates = {
  // 1. Email Verification
  emailVerification: (userName: string, verifyUrl: string) => ({
    subject: 'Verify Your Email - Solariem',
    html: getBaseTemplate(
      'Verify Your Email',
      `
      <p>Welcome to Solariem! We're excited to have you on board.</p>
      <p>To get started and access all our private banking features, please verify your email address by clicking the button below:</p>
      <div class="button-container">
        <a href="${verifyUrl}" class="button">Verify Email Address</a>
      </div>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="font-size: 12px; color: #6b7280; word-break: break-all;">${verifyUrl}</p>
      `,
      userName
    ),
    text: `Hello ${userName}, Welcome to Solariem! Please verify your email by following this link: ${verifyUrl}`
  }),

  // 2. Password Reset
  passwordReset: (userName: string, resetUrl: string) => ({
    subject: 'Reset Your Password - Solariem',
    html: getBaseTemplate(
      'Reset Your Password',
      `
      <p>We received a request to reset your password for your Solariem account.</p>
      <p>If you made this request, click the button below to set a new password:</p>
      <div class="button-container">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
      <p>This link will expire in 1 hour for your security.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      `,
      userName
    ),
    text: `Hello ${userName}, someone requested a password reset for your Solariem account. Use this link: ${resetUrl}`
  }),

  // 3. Welcome (Sign up)
  welcome: (userName: string) => ({
    subject: 'Welcome to Solariem! 🚀',
    html: getBaseTemplate(
      'Welcome Aboard!',
      `
      <p>Your account has been successfully created. We're thrilled to have you join our community!</p>
      <p>With Solariem, you can:</p>
      <ul>
        <li>Securely hold and manage assets</li>
        <li>Track recovery progress in real-time</li>
        <li>Access private wealth management tools</li>
        <li>Connect with 24/7 dedicated advisors</li>
      </ul>
      <p>Ready to start your journey?</p>
      <div class="button-container">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Go to Dashboard</a>
      </div>
      `,
      userName
    ),
    text: `Hello ${userName}, Welcome to Solariem! Your account has been created successfully.`
  }),

  // 4. Deposit Confirmation
  depositConfirmation: (userName: string, amount: number, transactionId: string, status: string = 'approved', paymentMethodName: string = 'Bank Transfer', currency: string = 'USD') => {
    const sym = getCurrencySymbol(currency);
    return {
    subject: `Deposit ${status === 'approved' ? 'Successful' : 'Pending'} - Solariem`,
    html: getBaseTemplate(
      `Deposit ${status === 'approved' ? 'Confirmed' : 'Received'}`,
      `
      <p>Your deposit has been ${status === 'approved' ? 'successfully processed and added to your balance' : 'received and is currently pending review'}.</p>
      <table class="data-table">
        <tr><td>Amount:</td><td class="highlight">${sym}${amount.toLocaleString()}</td></tr>
        <tr><td>Payment Method:</td><td>${paymentMethodName}</td></tr>
        <tr><td>Transaction ID:</td><td>${transactionId}</td></tr>
        <tr><td>Status:</td><td>${status.toUpperCase()}</td></tr>
        <tr><td>Date:</td><td>${new Date().toLocaleDateString()}</td></tr>
      </table>
      ${status === 'approved' ? '<p>You can now use these funds within your private account features.</p>' : '<p>We will notify you once your deposit has been approved.</p>'}
      <div class="button-container">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View Dashboard</a>
      </div>
      `,
      userName
    ),
    text: `Hello ${userName}, your deposit of ${sym}${amount} via ${paymentMethodName} is ${status}. Transaction ID: ${transactionId}`
    };
  },

  // 5. Withdrawal Confirmation
  withdrawalConfirmation: (userName: string, amount: number, transactionId: string, status: string = 'pending', paymentMethodName: string = 'Bank Transfer', currency: string = 'USD') => {
    const sym = getCurrencySymbol(currency);
    return {
    subject: `Withdrawal ${status === 'approved' ? 'Processed' : 'Request Received'} - Solariem`,
    html: getBaseTemplate(
      `Withdrawal ${status === 'approved' ? 'Successful' : 'Request'}`,
      `
      <p>Your withdrawal ${status === 'approved' ? 'has been processed successfully' : 'request has been received and is being reviewed by our team'}.</p>
      <table class="data-table">
        <tr><td>Amount:</td><td class="highlight">${sym}${amount.toLocaleString()}</td></tr>
        <tr><td>Payment Method:</td><td>${paymentMethodName}</td></tr>
        <tr><td>Transaction ID:</td><td>${transactionId}</td></tr>
        <tr><td>Status:</td><td>${status.toUpperCase()}</td></tr>
        <tr><td>Date:</td><td>${new Date().toLocaleDateString()}</td></tr>
      </table>
      <p>Expect your funds to reach your provided destination shortly after approval.</p>
      <div class="button-container">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View Dashboard</a>
      </div>
      `,
      userName
    ),
    text: `Hello ${userName}, your withdrawal of ${sym}${amount} via ${paymentMethodName} is ${status}. Transaction ID: ${transactionId}`
    };
  },

  // 6. Money Transfer
  moneyTransfer: (userName: string, amount: number, recipientEmail: string, type: 'sent' | 'received', currency: string = 'USD') => {
    const sym = getCurrencySymbol(currency);
    return {
    subject: `Money Transfer ${type === 'sent' ? 'to' : 'from'} ${recipientEmail} - Solariem`,
    html: getBaseTemplate(
      `Money ${type === 'sent' ? 'Sent' : 'Received'}`,
      `
      <p>You have successfully ${type === 'sent' ? 'sent' : 'received'} a money transfer.</p>
      <table class="data-table">
        <tr><td>Amount:</td><td class="highlight">${sym}${amount.toLocaleString()}</td></tr>
        <tr><td>${type === 'sent' ? 'Recipient' : 'Sender'}:</td><td>${recipientEmail}</td></tr>
        <tr><td>Date:</td><td>${new Date().toLocaleDateString()}</td></tr>
      </table>
      <div class="button-container">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Check Balance</a>
      </div>
      `,
      userName
    ),
    text: `Hello ${userName}, you have ${type} ${sym}${amount} ${type === 'sent' ? 'to' : 'from'} ${recipientEmail}.`
    };
  },

  // 7. Withdrawal/Deposit Request (Admin only)
  adminAlert: (type: 'Deposit' | 'Withdrawal', userEmail: string, amount: number, transactionId: string, paymentMethodName: string = 'Bank Transfer', currency: string = 'USD') => {
    const sym = getCurrencySymbol(currency);
    return {
    subject: `Admin Alert: New ${type} Request - ${sym}${amount}`,
    html: getBaseTemplate(
      `New ${type} Request`,
      `
      <p>A user has submitted a new ${type.toLowerCase()} request for review.</p>
      <table class="data-table">
        <tr><td>User:</td><td>${userEmail}</td></tr>
        <tr><td>Amount:</td><td class="highlight">${sym}${amount.toLocaleString()}</td></tr>
        <tr><td>Payment Method:</td><td>${paymentMethodName}</td></tr>
        <tr><td>Transaction ID:</td><td>${transactionId}</td></tr>
        <tr><td>Date:</td><td>${new Date().toLocaleString()}</td></tr>
      </table>
      <p>Please log in to the admin dashboard to process this request.</p>
      <div class="button-container">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard?section=admin" class="button">Admin Dashboard</a>
      </div>
      `,
      'Admin'
    ),
    text: `Admin Alert: New ${type} request of ${sym}${amount} via ${paymentMethodName} from ${userEmail}.`
    };
  },

  // 8. Broadcast Intelligence
  broadcastEmail: (subject: string, htmlContent: string) => ({
    subject: subject,
    html: getBaseTemplate(
      subject,
      `
      <div class="broadcast-payload">
        ${htmlContent}
      </div>
      <p style="font-size: 10px; color: #9ca3af; margin-top: 40px; text-align: center; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
        Transmission Authorised by Global Wealth Management Intelligence
      </p>
      `
    ),
    text: `Solariem Intelligence Update: ${subject}`
  }),

  // 13. Support Response Protocol
  supportResponse: (userName: string, subject: string, reply: string) => ({
    subject: `Secure Response: ${subject} - Solariem`,
    html: getBaseTemplate(
      'Authorised Intelligence Response',
      `
      <p>A secure response has been authorised for your enquiry: <strong>${subject}</strong></p>
      <div style="background-color: #F5F4F0; padding: 25px; border-radius: 12px; border: 1px solid #E6E4DE; margin: 30px 0;">
        <p style="margin: 0; font-size: 15px; color: #14130F; line-height: 1.6;">${reply}</p>
      </div>
      <p>If you require further assistance, please log in to your dashboard and initiate a follow-up sequence.</p>
      <div class="button-container">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard?section=support" class="button">View Communications</a>
      </div>
      `,
      userName
    ),
    text: `Hello ${userName}, an admin has replied to your support request: ${subject}. Reply: ${reply}`
  }),

  // 14. Recovery Claim Confirmation
  recoveryClaimConfirmation: (userName: string, claimNumber: string, scamType: string) => ({
    subject: `Claim Received: Case #${claimNumber} - Solariem`,
    html: getBaseTemplate(
      'Recovery Claim Filed',
      `
      <p>Your forensic briefing has been received and logged into our secure registry.</p>
      <table class="data-table">
        <tr><td>Claim Number:</td><td class="highlight">${claimNumber}</td></tr>
        <tr><td>Scam Type:</td><td>${scamType}</td></tr>
        <tr><td>Status:</td><td>PENDING REVIEW</td></tr>
        <tr><td>Date Filed:</td><td>${new Date().toLocaleDateString()}</td></tr>
      </table>
      <p>Our intelligence division will begin a preliminary audit of your case. You can track your claim progress using your email and claim number.</p>
      <div class="button-container">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/track-claim" class="button">Track Your Claim</a>
      </div>
      `,
      userName
    ),
    text: `Hello ${userName}, your recovery claim #${claimNumber} for ${scamType} has been received. Track it here: ${process.env.NEXT_PUBLIC_APP_URL}/track-claim`
  }),

  // 15. Recovery Claim Admin Alert
  recoveryClaimAdminAlert: (userEmail: string, claimNumber: string, scamType: string, amount: number, currency: string = 'USD') => {
    const sym = getCurrencySymbol(currency);
    return {
    subject: `Admin Alert: New Recovery Claim #${claimNumber}`,
    html: getBaseTemplate(
      'New Recovery Briefing',
      `
      <p>A new fraud recovery claim has been transmitted for forensic evaluation.</p>
      <table class="data-table">
        <tr><td>User Email:</td><td>${userEmail}</td></tr>
        <tr><td>Claim Number:</td><td>${claimNumber}</td></tr>
        <tr><td>Scam Type:</td><td>${scamType}</td></tr>
        <tr><td>Amount Lost:</td><td class="highlight">${sym}${amount.toLocaleString()}</td></tr>
        <tr><td>Timestamp:</td><td>${new Date().toLocaleString()}</td></tr>
      </table>
      <p>Immediate officer assignment is recommended for this asset repatriation protocol.</p>
      <div class="button-container">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard?section=admin" class="button">Admin Dashboard</a>
      </div>
      `,
      'Forensic Admin'
    ),
    text: `Admin Alert: New Recovery Claim #${claimNumber} from ${userEmail}. Amount: ${sym}${amount}.`
    };
  },

  // 16. Recovery Claim Status Update
  recoveryClaimStatusUpdate: (userName: string, claimNumber: string, status: string, message: string) => ({
    subject: `Case Update: Case #${claimNumber} Status Shift - Solariem`,
    html: getBaseTemplate(
      'Forensic Case Intelligence Update',
      `
      <p>An authorised update has been posted to your recovery case timeline.</p>
      <table class="data-table">
        <tr><td>Claim Number:</td><td class="highlight">${claimNumber}</td></tr>
        <tr><td>New Status:</td><td>${status.toUpperCase().replace('_', ' ')}</td></tr>
        <tr><td>Update Time:</td><td>${new Date().toLocaleString()}</td></tr>
      </table>
      <div style="background-color: #F5F4F0; padding: 25px; border-radius: 12px; border: 1px solid #E6E4DE; margin: 30px 0;">
        <p style="margin: 0; font-size: 15px; color: #14130F; line-height: 1.6;"><strong>Forensic Note:</strong> ${message}</p>
      </div>
      <p>Please use the button below to view the full chronology of your repatriation process.</p>
      <div class="button-container">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/track-claim" class="button">Track Your Claim</a>
      </div>
      `,
      userName
    ),
    text: `Hello ${userName}, your case #${claimNumber} has been updated to ${status}. Note: ${message}`
  }),

  // 17. Recovery Claim Completion (Final Instruction)
  recoveryClaimCompletion: (userName: string, claimNumber: string, recoveredAmount: number, serviceFee: number, currency: string = 'USD') => {
    const sym = getCurrencySymbol(currency);
    return {
    subject: `Case #${claimNumber} update: funds identified and ready to release`,
    html: getBaseTemplate(
      'Recovery update: funds identified',
      `
      <p>We have identified funds arising from your case. The figures below are what we hold and what is due to you after our fee.</p>
      <table class="data-table">
        <tr><td>Claim Number:</td><td>${claimNumber}</td></tr>
        <tr><td>Amount identified:</td><td class="highlight">${sym}${recoveredAmount.toLocaleString()}</td></tr>
        <tr><td>Success fee:</td><td>${sym}${serviceFee.toLocaleString()}</td></tr>
        <tr><td>Net payout:</td><td class="highlight">${sym}${(recoveredAmount - serviceFee).toLocaleString()}</td></tr>
      </table>
      <p><strong>What happens next:</strong> To release funds we need an active Solariem account in your own name. If you do not have one, register using the button below. We will confirm receipt of the fee and the completed identity check before release, and we will tell you if either is outstanding.</p>
      <div class="button-container">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/signup" class="button">Create Account / Login</a>
      </div>
      <p style="text-align: center; font-size: 12px; color: #6b7280; margin-top: 20px;">
        We will not ask you for a bank detail, a wallet address, or a payment by any other route in
        reply to this email. If you receive a request like that, it did not come from us.
      </p>
      `,
      userName
    ),
    text: `Hello ${userName}, case #${claimNumber} finalized. ${sym}${recoveredAmount} recovered. Register at ${process.env.NEXT_PUBLIC_APP_URL}/signup to receive funds.`
    };
  },

  // 18. Account Status Update
  accountStatusUpdate: (userName: string, status: 'block' | 'restrict' | 'normal' | 'blocked' | 'restricted', reason: string, fee: number = 0, currency: string = 'USD') => {
    const sym = getCurrencySymbol(currency);
    const statusTitles: Record<string, string> = {
      block: 'ACCOUNT ACCESS SUSPENDED',
      blocked: 'ACCOUNT ACCESS SUSPENDED',
      restrict: 'ACCOUNT ACTIVITY RESTRICTED',
      restricted: 'ACCOUNT ACTIVITY RESTRICTED',
      normal: 'ACCOUNT STATUS RESTORED'
    };

    const statusColors: Record<string, string> = {
      block: '#A33528',
      blocked: '#A33528',
      restrict: '#f59e0b',
      restricted: '#f59e0b',
      normal: '#10b981'
    };

    return {
      subject: `Account Status Update: ${status.toUpperCase()} - Solariem`,
      html: getBaseTemplate(
        statusTitles[status],
        `
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; padding: 10px 20px; border-radius: 99px; background-color: ${statusColors[status]}20; color: ${statusColors[status]}; font-weight: 800; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; border: 1px solid ${statusColors[status]}40;">
            Current Status: ${status}
          </div>
        </div>
        <p>This is an automated intelligence briefing regarding a shift in your account's operational status.</p>
        <div style="background-color: #F5F4F0; padding: 25px; border-radius: 12px; border: 1px solid #E6E4DE; margin: 30px 0;">
          <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;"><strong>Reason for Adjustment:</strong><br>${reason}</p>
        </div>
        ${status !== 'normal' && fee > 0 ? `
        <table class="data-table">
          <tr><td>Safety Clearance Fee:</td><td class="highlight">${sym}${fee.toLocaleString()}</td></tr>
          <tr><td>Protocol:</td><td>Refundable Security Deposit</td></tr>
        </table>
        <p style="font-size: 13px; color: #6b7280; font-style: italic;">Note: This fee is a refundable security protocol and will be credited back to your balance upon account restoration.</p>
        ` : ''}
        <p>To ${status === 'normal' ? 'resume' : 'initiate status resolution'} and access your assets, please log in to your dashboard.</p>
        <div class="button-container">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Go to Dashboard</a>
        </div>
        `,
        userName
      ),
      text: `Hello ${userName}, your account status has been updated to ${status.toUpperCase()}. Reason: ${reason}. ${fee > 0 ? `Unblock fee: ${sym}${fee}` : ''}`
    };
  },

  // 19. Withdrawal code issuance
  // For users: only show the abbreviation (TAC, MFA, TVC, SAC). The full
  // meaning of these codes is intentionally hidden from end users — admins
  // see the full labels in the admin UI.
  withdrawalCode: (
    userName: string,
    codeType: 'TAC' | 'MFA' | 'TVC' | 'SAC',
    code: string,
    expiresAtIso: string,
    fee: number = 0,
    currency: string = 'USD'
  ) => {
    const sym = getCurrencySymbol(currency);
    return {
      subject: `Your ${codeType} - Solariem`,
      html: getBaseTemplate(
        `${codeType}`,
        `
        <p>Hello ${userName},</p>
        <p>You requested a <strong>${codeType}</strong> to continue a withdrawal. Use the code below to verify the corresponding step in the dashboard.</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 18px 32px; border-radius: 12px; background-color: #14130F; color: #0E5A50; font-size: 28px; font-weight: 800; letter-spacing: 0.3em; font-family: 'Courier New', monospace;">
            ${code}
          </div>
        </div>
        <table class="data-table">
          <tr><td>Code Type:</td><td class="highlight">${codeType}</td></tr>
          <tr><td>Expires:</td><td>${expiresAtIso}</td></tr>
          ${fee > 0 ? `<tr><td>Fee Charged:</td><td class="highlight">${sym}${fee.toLocaleString()}</td></tr>` : '<tr><td>Fee:</td><td>None</td></tr>'}
        </table>
        <p style="font-size: 13px; color: #6b7280; font-style: italic;">This code expires in 10 minutes. If you did not request it, log in to your dashboard and review your recent activity.</p>
        <div class="button-container">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard?section=withdraw" class="button">Enter Code</a>
        </div>
        `,
        userName
      ),
      text: `Your ${codeType} code is ${code}. It expires at ${expiresAtIso}. ${fee > 0 ? `Fee: ${sym}${fee}` : ''} Log in to your dashboard to enter it.`
    };
  },
};



