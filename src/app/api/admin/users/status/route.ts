import { NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const POST = requireAdmin(async (request, context) => {
    try {
        const { userId, action, fee, reason } = await request.json();

        if (!userId || !action) {
            return NextResponse.json({ success: false, error: 'User ID and action are required' }, { status: 400 });
        }

        if (action !== 'block' && action !== 'restrict' && action !== 'normal') {
            return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }

        const db = await getDb();
        const usersCollection = db.collection('users');

        // Get user
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        let updateData: any = {
            updatedAt: new Date(),
            updatedBy: 'admin'
        };

        let notificationTitle = '';
        let notificationMessage = '';
        let notificationType: 'account_blocked' | 'account_restricted' | 'account_unblocked' = 'account_unblocked';
        let activityAction = '';

        if (action === 'block') {
            updateData.isAccountBlocked = true;
            updateData.isAccountRestricted = false;
            updateData.accountBlockReason = reason || 'Security verification required';
            updateData.accountUnblockFee = parseFloat(fee) || 0;

            notificationTitle = 'ACCOUNT TEMPORARILY BLOCKED';
            notificationMessage = `Your account has been temporarily blocked for security reasons: ${updateData.accountBlockReason}. A safety release fee of ${user.currency || 'USD'} ${updateData.accountUnblockFee} is required.`;
            notificationType = 'account_blocked';
            activityAction = `Account blocked by admin. Reason: ${updateData.accountBlockReason}. Fee: ${user.currency || 'USD'} ${updateData.accountUnblockFee}`;
        } else if (action === 'restrict') {
            updateData.isAccountRestricted = true;
            updateData.isAccountBlocked = false;
            updateData.accountBlockReason = reason || 'Financial activity restricted';
            updateData.accountUnblockFee = parseFloat(fee) || 0;

            notificationTitle = 'ACCOUNT ACTIVITY RESTRICTED';
            notificationMessage = `Your account functionality has been restricted: ${updateData.accountBlockReason}. You can still view your dashboard, but financial actions are disabled until a release fee of ${user.currency || 'USD'} ${updateData.accountUnblockFee} is processed.`;
            notificationType = 'account_restricted';
            activityAction = `Account restricted by admin. Reason: ${updateData.accountBlockReason}. Fee: ${user.currency || 'USD'} ${updateData.accountUnblockFee}`;
        } else {
            // normal (this is essentially unblock but without the refund logic of the other API)
            // usually unblock should be used for the refund, but this is a manual reset
            updateData.isAccountBlocked = false;
            updateData.isAccountRestricted = false;
            updateData.accountBlockReason = '';
            updateData.accountUnblockFee = 0;

            notificationTitle = 'ACCOUNT STATUS UPDATED';
            notificationMessage = `Your account status has been updated to Normal by the administration.`;
            notificationType = 'account_unblocked';
            activityAction = `Account status reset to Normal by admin manually.`;
        }

        // Add activity log entry
        const activityEntry = {
            action: activityAction,
            timestamp: new Date().toISOString()
        };

        await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: updateData,
                $push: { activityLog: { $each: [activityEntry], $position: 0 } }
            } as any
        );

        // Send notification
        const notificationData = {
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType,
            recipients: [userId],
            sentBy: 'admin',
            createdAt: new Date()
        };
        await db.collection('notifications').insertOne(notificationData);

        // Send Email
        try {
            const { emailTemplates, sendEmail } = await import('@/lib/email');
            const emailTemplate = emailTemplates.accountStatusUpdate(
                user.firstName || user.displayName || 'User',
                action,
                reason || (action === 'normal' ? 'Account verification complete' : 'Security audit required'),
                action !== 'normal' ? (parseFloat(fee) || 0) : 0,
                user.currency || 'USD'
            );

            await sendEmail({
                to: user.email,
                ...emailTemplate
            });
        } catch (emailError) {
            console.error('Failed to send status update email:', emailError);
        }

        return NextResponse.json({
            success: true,
            message: `User account ${action}ed successfully`,
            data: updateData
        });

    } catch (error) {
        console.error('Error updating user status:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' },
            { status: 500 }
        );
    }
});
