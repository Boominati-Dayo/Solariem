import { ObjectId, Db } from 'mongodb';
import { emailTemplates, sendEmail } from '@/lib/email';

export async function processAccountUnblock(db: Db, userId: string, adminId: string = 'system') {
    const usersCollection = db.collection('users');

    // Get user
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) throw new Error('User not found');

    if (!user.isAccountBlocked && !user.isAccountRestricted) {
        return { success: false, message: 'User is not blocked or restricted' };
    }

    const unblockFee = user.accountUnblockFee || 0;

    // 1. Create Deduction Transaction
    const deductionTransaction = {
        type: 'fee',
        amount: -unblockFee,
        date: new Date(),
        status: 'completed',
        description: 'Account Security Release Fee Protocol'
    };

    // 2. Create Refund Transaction
    const refundTransaction = {
        type: 'refund',
        amount: unblockFee,
        date: new Date(),
        status: 'completed',
        description: 'Account Security Release Fee Refund'
    };

    // 3. Update User
    const activityEntry = {
        action: `Security release protocol executed. Status restored to Normal. Refund of ${user.currency || 'USD'} ${unblockFee} accounted in ledger.`,
        timestamp: new Date().toISOString()
    };

    await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        {
            $set: {
                isAccountBlocked: false,
                isAccountRestricted: false,
                accountBlockReason: '',
                accountUnblockFee: 0,
                updatedAt: new Date(),
                updatedBy: adminId
            },
            $push: {
                activityLog: { $each: [activityEntry], $position: 0 },
                transactions: { $each: [deductionTransaction, refundTransaction] }
            }
        } as any
    );

    // 4. Send Notification
    const notificationData = {
        title: 'ACCOUNT RESTORATION SUCCESSFUL',
        message: `Your account has been successfully restored to Normal status. The safety protocol of ${user.currency || 'USD'} ${unblockFee} has been accounted for and refunded to your ledger.`,
        type: 'account_unblocked',
        recipients: [userId],
        sentBy: adminId,
        createdAt: new Date()
    };
    await db.collection('notifications').insertOne(notificationData);

    // 5. Send Email
    try {
        const emailTemplate = emailTemplates.accountStatusUpdate(
            user.firstName || user.displayName || 'User',
            'normal',
            'Security verification protocol completed successfully',
            0,
            user.currency || 'USD'
        );

        await sendEmail({
            to: user.email,
            ...emailTemplate
        });
    } catch (error) {
        console.error('Failed to send unblock email:', error);
    }

    return { success: true, message: 'Account unblocked successfully' };
}
