import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendEmail, emailTemplates, getBaseTemplate } from '@/lib/email';
import { getCurrencySymbol } from '@/lib/currencies';

interface NotificationData {
  title: string;
  message: string;
  type: 'deposit_request' | 'withdrawal_request' | 'deposit_approval' | 'deposit_decline' | 'withdrawal_approval' | 'withdrawal_decline' | 'referral_gain' | 'broadcast' | 'individual' | 'transfer_sent' | 'transfer_received' | 'welcome' | 'support_sent' | 'support_reply' | 'login' | 'logout' | 'user_activity' | 'kyc_approval' | 'kyc_decline' | 'account_blocked' | 'account_unblocked' | 'account_restricted';
  recipients: string[] | 'all';
  sentBy: string;
  metadata?: {
    transactionId?: string;
    amount?: number;
    referralCode?: string;
    userId?: string;
    userEmail?: string;
    receiverEmail?: string;
    fee?: number;
    senderEmail?: string;
    transferAmount?: number;
    supportMessageId?: string;
    loginTime?: string;
    logoutTime?: string;
    activityType?: string;
    reason?: string;
    capitalReturned?: boolean;
    balanceType?: string;
    action?: string;
    refundTotal?: number;
  };
}

export class NotificationService {
  static async createNotification(notificationData: NotificationData) {
    const db = await getDb();

    // If recipients is 'all' and type is broadcast, send to admins only
    if (notificationData.recipients === 'all' && notificationData.type === 'broadcast') {
      const adminUsers = await db.collection('users').find({ isAdmin: true }).toArray();
      notificationData.recipients = adminUsers.map(admin => admin._id?.toString()).filter(Boolean) as string[];
    }

    const notification = {
      ...notificationData,
      sentAt: new Date(),
      read: false
    };

    const result = await db.collection('notifications').insertOne(notification);
    return { _id: result.insertedId, ...notification };
  }

  // Deposit Request Notifications
  static async notifyDepositRequest(userId: string, userEmail: string, amount: number, transactionId: string, paymentMethodName: string = 'Bank Transfer', currency: string = 'USD') {
    const db = await getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    const userName = user?.firstName || userEmail;
    const userCurrency = user?.currency || currency || 'USD';
    const sym = getCurrencySymbol(userCurrency);

    // Get admin users
    const adminUsers = await db.collection('users').find({ isAdmin: true }).toArray();
    const adminIds = adminUsers.map(admin => admin._id?.toString()).filter(Boolean);

    // Notify user
    await this.createNotification({
      title: 'Deposit Request Submitted',
      message: `Your deposit request of ${sym}${amount} via ${paymentMethodName} has been submitted and is pending review.`,
      type: 'deposit_request',
      recipients: [userId],
      sentBy: 'system',
      metadata: { transactionId, amount }
    });

    // Email user
    const userEmailData = emailTemplates.depositConfirmation(userName, amount, transactionId, 'pending', paymentMethodName, userCurrency);
    await sendEmail({
      to: userEmail,
      subject: userEmailData.subject,
      html: userEmailData.html,
      text: userEmailData.text
    });

    // Notify all admins
    if (adminIds.length > 0) {
      await this.createNotification({
        title: 'New Deposit Request',
        message: `${userEmail} has submitted a deposit request of ${sym}${amount} via ${paymentMethodName}. Please review and process.`,
        type: 'deposit_request',
        recipients: adminIds,
        sentBy: 'system',
        metadata: { transactionId, amount }
      });

      // Email admins
      for (const admin of adminUsers) {
        if (admin.email) {
          const adminEmailData = emailTemplates.adminAlert('Deposit', userEmail, amount, transactionId, paymentMethodName, userCurrency);
          await sendEmail({
            to: admin.email,
            subject: adminEmailData.subject,
            html: adminEmailData.html,
            text: adminEmailData.text
          });
        }
      }
    }
  }

  // Withdrawal Request Notifications
  static async notifyWithdrawalRequest(userId: string, userEmail: string, amount: number, transactionId: string, paymentMethodName: string = 'Bank Transfer', currency: string = 'USD') {
    const db = await getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    const userName = user?.firstName || userEmail;
    const userCurrency = user?.currency || currency || 'USD';
    const sym = getCurrencySymbol(userCurrency);

    // Get admin users
    const adminUsers = await db.collection('users').find({ isAdmin: true }).toArray();
    const adminIds = adminUsers.map(admin => admin._id?.toString()).filter(Boolean);

    // Notify user
    await this.createNotification({
      title: 'Withdrawal Request Submitted',
      message: `Your withdrawal request of ${sym}${amount} via ${paymentMethodName} has been submitted and is pending review.`,
      type: 'withdrawal_request',
      recipients: [userId],
      sentBy: 'system',
      metadata: { transactionId, amount }
    });

    // Email user
    const userEmailData = emailTemplates.withdrawalConfirmation(userName, amount, transactionId, 'pending', paymentMethodName, userCurrency);
    await sendEmail({
      to: userEmail,
      subject: userEmailData.subject,
      html: userEmailData.html,
      text: userEmailData.text
    });

    // Notify all admins
    if (adminIds.length > 0) {
      await this.createNotification({
        title: 'New Withdrawal Request',
        message: `${userEmail} has submitted a withdrawal request of ${sym}${amount} via ${paymentMethodName}. Please review and process.`,
        type: 'withdrawal_request',
        recipients: adminIds,
        sentBy: 'system',
        metadata: { transactionId, amount }
      });

      // Email admins
      for (const admin of adminUsers) {
        if (admin.email) {
          const adminEmailData = emailTemplates.adminAlert('Withdrawal', userEmail, amount, transactionId, paymentMethodName, userCurrency);
          await sendEmail({
            to: admin.email,
            subject: adminEmailData.subject,
            html: adminEmailData.html,
            text: adminEmailData.text
          });
        }
      }
    }
  }

  // Deposit Approval Notifications
  static async notifyDepositApproval(userId: string, userEmail: string, amount: number, transactionId: string, paymentMethodName: string = 'Bank Transfer') {
    const db = await getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    const userName = user?.firstName || userEmail;
    const userCurrency = user?.currency || 'USD';
    const sym = getCurrencySymbol(userCurrency);

    await this.createNotification({
      title: 'Deposit Approved',
      message: `Your deposit of ${sym}${amount} via ${paymentMethodName} has been approved and added to your account balance.`,
      type: 'deposit_approval',
      recipients: [userId],
      sentBy: 'system',
      metadata: { transactionId, amount }
    });

    // Email user
    const emailData = emailTemplates.depositConfirmation(userName, amount, transactionId, 'approved', paymentMethodName, userCurrency);
    await sendEmail({
      to: userEmail,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    });
  }

  // Deposit Decline Notifications
  static async notifyDepositDecline(userId: string, userEmail: string, amount: number, transactionId: string, reason?: string) {
    const db = await getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    const userName = user?.firstName || userEmail;
    const userCurrency = user?.currency || 'USD';
    const sym = getCurrencySymbol(userCurrency);

    await this.createNotification({
      title: 'Deposit Declined',
      message: `Your deposit of ${sym}${amount} has been declined.${reason ? ` Reason: ${reason}` : ''}`,
      type: 'deposit_decline',
      recipients: [userId],
      sentBy: 'system',
      metadata: { transactionId, amount, reason }
    });

    // Email user
    await sendEmail({
      to: userEmail,
      subject: 'Deposit Declined - Solariem',
      html: getBaseTemplate(
        'Deposit Declined',
        `
        <p>We regret to inform you that your deposit of <strong>${sym}${amount}</strong> has been declined.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>Transaction ID: <span style="font-family: monospace;">${transactionId}</span></p>
        <p>If you believe this is an error, please contact our support team.</p>
        <div class="button-container">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard?section=deposit" class="button">Contact Support</a>
        </div>
        `,
        userName
      ),
      text: `Your deposit of ${sym}${amount} has been declined. ${reason ? `Reason: ${reason}` : ''} Transaction ID: ${transactionId}`
    });
  }

  // Withdrawal Approval Notifications
  static async notifyWithdrawalApproval(userId: string, userEmail: string, amount: number, transactionId: string, paymentMethodName: string = 'Bank Transfer') {
    const db = await getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    const userName = user?.firstName || userEmail;
    const userCurrency = user?.currency || 'USD';
    const sym = getCurrencySymbol(userCurrency);

    await this.createNotification({
      title: 'Withdrawal Approved',
      message: `Your withdrawal of ${sym}${amount} via ${paymentMethodName} has been approved and will be processed shortly.`,
      type: 'withdrawal_approval',
      recipients: [userId],
      sentBy: 'system',
      metadata: { transactionId, amount }
    });

    // Email user
    const emailData = emailTemplates.withdrawalConfirmation(userName, amount, transactionId, 'approved', paymentMethodName, userCurrency);
    await sendEmail({
      to: userEmail,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    });
  }

  // Withdrawal Decline Notifications
  static async notifyWithdrawalDecline(userId: string, userEmail: string, amount: number, transactionId: string, reason?: string, refundTotal: number = 0) {
    const db = await getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    const userName = user?.firstName || userEmail;
    const userCurrency = user?.currency || 'USD';
    const sym = getCurrencySymbol(userCurrency);

    const refundNote = refundTotal > 0
      ? ` Your code fees of ${sym}${refundTotal.toFixed(2)} have been refunded to your balance.`
      : '';

    await this.createNotification({
      title: 'Withdrawal Declined',
      message: `Your withdrawal of ${sym}${amount} has been declined.${reason ? ` Reason: ${reason}` : ''}${refundNote}`,
      type: 'withdrawal_decline',
      recipients: [userId],
      sentBy: 'system',
      metadata: { transactionId, amount, reason, refundTotal }
    });

    // Email user
    await sendEmail({
      to: userEmail,
      subject: 'Withdrawal Declined - Solariem',
      html: getBaseTemplate(
        'Withdrawal Declined',
        `
        <p>We regret to inform you that your withdrawal of <strong>${sym}${amount}</strong> has been declined.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        ${refundTotal > 0 ? `<p>Your code fees of <strong>${sym}${refundTotal.toFixed(2)}</strong> have been refunded to your balance.</p>` : ''}
        <p>Transaction ID: <span style="font-family: monospace;">${transactionId}</span></p>
        <p>If you believe this is an error, please contact our support team.</p>
        <div class="button-container">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard?section=withdraw" class="button">Contact Support</a>
        </div>
        `,
        userName
      ),
      text: `Your withdrawal of ${sym}${amount} has been declined. ${reason ? `Reason: ${reason}` : ''}${refundTotal > 0 ? ` Code fees of ${sym}${refundTotal.toFixed(2)} have been refunded to your balance.` : ''} Transaction ID: ${transactionId}`
    });
  }

  // Referral Gain Notifications
  static async notifyReferralGain(userId: string, userEmail: string, amount: number, referralCode: string) {
    const db = await getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    const userName = user?.firstName || userEmail;
    const userCurrency = user?.currency || 'USD';
    const sym = getCurrencySymbol(userCurrency);

    await this.createNotification({
      title: 'Referral Bonus Earned',
      message: `You have earned ${sym}${amount} referral bonus from user with code ${referralCode}.`,
      type: 'referral_gain',
      recipients: [userId],
      sentBy: 'system',
      metadata: { amount, referralCode }
    });

    // Email user
    await sendEmail({
      to: userEmail,
      subject: 'Referral Bonus Earned - Solariem',
      html: getBaseTemplate(
        'Referral Bonus Earned!',
        `
        <p>Congratulations! You have earned <strong>${sym}${amount}</strong> referral bonus.</p>
        <p>Referral Code: ${referralCode}</p>
        <p>Keep referring to earn more!</p>
        `,
        userName
      ),
      text: `You have earned ${sym}${amount} referral bonus from user with code ${referralCode}.`
    });
  }

  // Process referral bonuses (already mostly correct, but updating notification)
  static async processReferralBonus(referrerId: string, bonusAmount: number, referredUserCode: string) {
    const db = await getDb();
    const referrer = await db.collection('users').findOne({ _id: new ObjectId(referrerId) });

    await db.collection('users').updateOne(
      { _id: new ObjectId(referrerId) },
      {
        $inc: { 'balances.main': bonusAmount, 'balances.referral': bonusAmount },
        $push: {
          'transactions': {
            type: 'referral_bonus',
            amount: bonusAmount,
            referredUserCode: referredUserCode,
            date: new Date(),
            status: 'completed',
            description: `Referral bonus from user ${referredUserCode}`
          }
        }
      } as Record<string, unknown>
    );

    if (referrer && referrer.email) {
      await this.notifyReferralGain(referrerId, referrer.email, bonusAmount, referredUserCode);
    }
  }

  // Welcome notification
  static async notifyWelcome(userId: string, userEmail: string) {
    const db = await getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    const userName = user?.firstName || userEmail;

    await this.createNotification({
      title: 'Welcome to Solariem!',
      message: 'Welcome to Solariem! Your account has been created successfully. Start investing and grow your wealth.',
      type: 'welcome',
      recipients: [userId],
      sentBy: 'system',
      metadata: { userEmail }
    });

    // Email user
    const emailData = emailTemplates.welcome(userName);
    await sendEmail({
      to: userEmail,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    });
  }

  // Support message sent notification
  static async notifySupportSent(userId: string, userEmail: string, messageId: string) {
    const db = await getDb();
    const adminUsers = await db.collection('users').find({ isAdmin: true }).toArray();
    const adminIds = adminUsers.map(admin => admin._id?.toString()).filter(Boolean);

    await this.createNotification({
      title: 'Support Message Sent',
      message: 'Your support message has been sent successfully. Our team will respond within 24 hours.',
      type: 'support_sent',
      recipients: [userId],
      sentBy: 'system',
      metadata: { supportMessageId: messageId }
    });

    if (adminIds.length > 0) {
      await this.createNotification({
        title: 'New Support Message',
        message: `${userEmail} has sent a new support message.`,
        type: 'support_sent',
        recipients: adminIds,
        sentBy: 'system',
        metadata: { supportMessageId: messageId, userEmail }
      });
    }
  }

  // Support reply notification
  static async notifySupportReply(userId: string, userEmail: string, messageId: string) {
    const db = await getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    const userName = user?.firstName || userEmail;

    await this.createNotification({
      title: 'Support Reply Received',
      message: 'You have received a reply to your support message.',
      type: 'support_reply',
      recipients: [userId],
      sentBy: 'system',
      metadata: { supportMessageId: messageId }
    });

    // Email user
    await sendEmail({
      to: userEmail,
      subject: 'Support Reply Received - Solariem',
      html: getBaseTemplate(
        'Support Reply Received',
        `
        <p>You have received a reply to your support message.</p>
        <p>Please log in to your account to view the message in the support section.</p>
        <div class="button-container">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard?section=support" class="button">View Support Inbox</a>
        </div>
        `,
        userName
      ),
      text: `You have received a reply to your support message. Please log in to your account to view the reply.`
    });
  }

  // Login notification (for admins)
  static async notifyLogin(userId: string, userEmail: string, isAdmin: boolean = false) {
    if (isAdmin) {
      // Only notify other admins about admin logins
      const db = await getDb();
      const adminUsers = await db.collection('users').find({ isAdmin: true }).toArray();
      const adminIds = adminUsers.map(admin => admin._id?.toString()).filter(Boolean);

      await this.createNotification({
        title: 'Admin Login',
        message: `Admin ${userEmail} has logged in to the system.`,
        type: 'login',
        recipients: adminIds,
        sentBy: 'system',
        metadata: { userEmail, loginTime: new Date().toISOString() }
      });
    }
  }

  // Logout notification (for admins)
  static async notifyLogout(userId: string, userEmail: string, isAdmin: boolean = false) {
    if (isAdmin) {
      // Only notify other admins about admin logouts
      const db = await getDb();
      const adminUsers = await db.collection('users').find({ isAdmin: true }).toArray();
      const adminIds = adminUsers.map(admin => admin._id?.toString()).filter(Boolean);

      await this.createNotification({
        title: 'Admin Logout',
        message: `Admin ${userEmail} has logged out of the system.`,
        type: 'logout',
        recipients: adminIds,
        sentBy: 'system',
        metadata: { userEmail, logoutTime: new Date().toISOString() }
      });
    }
  }

  // User activity notification (for admins)
  static async notifyUserActivity(userId: string, userEmail: string, activityType: string, details?: string) {
    const db = await getDb();
    const adminUsers = await db.collection('users').find({ isAdmin: true }).toArray();
    const adminIds = adminUsers.map(admin => admin._id?.toString()).filter(Boolean);

    if (adminIds.length > 0) {
      await this.createNotification({
        title: 'User Activity',
        message: `User ${userEmail} performed ${activityType}.${details ? ` Details: ${details}` : ''}`,
        type: 'user_activity',
        recipients: adminIds,
        sentBy: 'system',
        metadata: { userEmail, activityType, userId }
      });
    }
  }

  // KYC Approval Notification
  static async notifyKycApproval(userId: string, userEmail: string) {
    const db = await getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    const userName = user?.firstName || userEmail;

    await this.createNotification({
      title: 'Identity Verified',
      message: 'Congratulations! Your identity documents have been verified. Your account is now fully active.',
      type: 'kyc_approval',
      recipients: [userId],
      sentBy: 'system'
    });

    // Email user
    await sendEmail({
      to: userEmail,
      subject: 'Identity Verified - Solariem',
      html: getBaseTemplate(
        'Identity Verified',
        `
        <p>Congratulations! Your identity documents have been successfully verified.</p>
        <p>Your account now has full access to all features on the platform.</p>
        <div class="button-container">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Go to Dashboard</a>
        </div>
        `,
        userName
      ),
      text: 'Congratulations! Your identity documents have been successfully verified. Your account now has full access to all features on the platform.'
    });
  }

  // KYC Decline Notification
  static async notifyKycDecline(userId: string, userEmail: string, reason?: string) {
    const db = await getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    const userName = user?.firstName || userEmail;

    await this.createNotification({
      title: 'Identity Verification Failed',
      message: `Your identity verification was declined.${reason ? ` Reason: ${reason}` : ''} Please resubmit your documents.`,
      type: 'kyc_decline',
      recipients: [userId],
      sentBy: 'system',
      metadata: { reason }
    });

    // Email user
    await sendEmail({
      to: userEmail,
      subject: 'Identity Verification Update - Solariem',
      html: getBaseTemplate(
        'Identity Verification Failed',
        `
        <p>We were unable to verify your identity documents.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>Please log in to your dashboard to resubmit clear copies of your identification documents.</p>
        <div class="button-container">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard?section=kyc" class="button">Resubmit KYC</a>
        </div>
        `,
        userName
      ),
      text: `Your identity verification was declined. ${reason ? `Reason: ${reason}` : ''} Please resubmit your documents.`
    });
  }
}
