import { NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserService } from '@/lib/auth/user';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NotificationService } from '@/lib/notifications/NotificationService';
import { verifyPinForUser } from '@/lib/auth/pin';
import { sendEmail, emailTemplates } from '@/lib/email';

export const POST = requireAuth(async (request: AuthenticatedRequest, context: any) => {
  try {
    const { receiverEmail, receiverUserCode, amount, pin } = await request.json();
    const senderId = request.user!.id;
    const senderEmail = request.user!.email;

    // Validate required fields
    if (!receiverEmail || !receiverUserCode || !amount) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount < 500 || amount > 10000) {
      return NextResponse.json(
        { success: false, error: 'Transfer amount must be between 500 and 10,000' },
        { status: 400 }
      );
    }

    // Get sender user
    const sender = await UserService.getUserById(senderId);
    if (!sender) {
      return NextResponse.json(
        { success: false, error: 'Sender not found' },
        { status: 404 }
      );
    }

    // Verify transaction PIN
    const isPinValid = await verifyPinForUser(sender, pin);
    if (!isPinValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing transaction PIN. Please try again.' },
        { status: 401 }
      );
    }

    const db = await getDb();

    // Validate receiver
    const receiver = await UserService.getUserByEmail(receiverEmail.toLowerCase());
    if (!receiver) {
      return NextResponse.json(
        { success: false, error: 'Receiver not found' },
        { status: 404 }
      );
    }

    if (receiver.userCode !== receiverUserCode) {
      return NextResponse.json(
        { success: false, error: 'Invalid receiver details' },
        { status: 400 }
      );
    }

    if (receiver._id === senderId) {
      return NextResponse.json(
        { success: false, error: 'Cannot transfer to yourself' },
        { status: 400 }
      );
    }

    if (!receiver.isActive) {
      return NextResponse.json(
        { success: false, error: 'Receiver account is deactivated' },
        { status: 400 }
      );
    }

    // Calculate transfer fee (2%)
    const transferFee = amount * 0.02;
    const totalDeduction = amount + transferFee;

    // Transfers draw on the spendable balance only. Referral credit is
    // accrual, not spendable, so it is excluded here.
    const senderMainBalance = sender.balances?.main || 0;
    if (senderMainBalance < totalDeduction) {
      return NextResponse.json(
        { success: false, error: `Insufficient balance. You have ${sender.currency || 'USD'} ${senderMainBalance.toFixed(2)} available to send.` },
        { status: 400 }
      );
    }

    const usersCollection = db.collection('users');

    // Start transaction
    const session = db.client.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Deduct from sender's main balance
        await usersCollection.updateOne(
          { _id: new ObjectId(senderId) },
          { 
            $inc: { 
              'balances.main': -totalDeduction,
              'balances.total': -totalDeduction
            },
            $push: {
              transactions: {
                type: 'transfer_sent',
                amount: -totalDeduction,
                description: `Transfer to ${receiverEmail}`,
                date: new Date(),
                status: 'completed',
                metadata: {
                  receiverEmail,
                  receiverUserCode,
                  transferAmount: amount,
                  fee: transferFee
                }
              }
            },
            $set: {
              updatedAt: new Date()
            }
          } as Record<string, unknown>,
          { session }
        );

        // Add to receiver's main balance
        await usersCollection.updateOne(
          { _id: new ObjectId(receiver._id) },
          { 
            $inc: { 
              'balances.main': amount,
              'balances.total': amount
            },
            $push: {
              transactions: {
                type: 'transfer_received',
                amount: amount,
                description: `Transfer from ${senderEmail}`,
                date: new Date(),
                status: 'completed',
                metadata: {
                  senderEmail,
                  transferAmount: amount
                }
              }
            },
            $set: {
              updatedAt: new Date()
            }
          } as Record<string, unknown>,
          { session }
        );

        // Create transfer record
        await db.collection('transfers').insertOne({
          senderId: new ObjectId(senderId),
          senderEmail,
          receiverId: new ObjectId(receiver._id),
          receiverEmail,
          receiverUserCode,
          amount,
          fee: transferFee,
          totalDeduction,
          status: 'completed',
          createdAt: new Date(),
          updatedAt: new Date()
        }, { session });
      });

      // Send notifications
      await Promise.all([
        // Notify sender
        NotificationService.createNotification({
          title: 'Transfer Completed',
          message: `You have successfully transferred ${sender.currency || 'USD'} ${amount.toFixed(2)} to ${receiverEmail}. Transfer fee: ${sender.currency || 'USD'} ${transferFee.toFixed(2)}`,
          type: 'transfer_sent',
          recipients: [senderId],
          sentBy: 'system',
          metadata: {
            receiverEmail,
            amount,
            fee: transferFee
          }
        }),

        // Notify receiver
        NotificationService.createNotification({
          title: 'Transfer Received',
          message: `You have received ${receiver.currency || 'USD'} ${amount.toFixed(2)} from ${senderEmail}`,
          type: 'transfer_received',
          recipients: [receiver._id?.toString() || ''],
          sentBy: 'system',
          metadata: {
            senderEmail,
            amount
          }
        }),

        // Email sender
        (async () => {
          const senderName = `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || senderEmail;
          const senderEmailData = emailTemplates.moneyTransfer(senderName, amount, receiverEmail, 'sent', sender.currency || 'USD');
          await sendEmail({
            to: senderEmail,
            subject: senderEmailData.subject,
            html: senderEmailData.html,
            text: senderEmailData.text
          });
        })(),

        // Email receiver
        (async () => {
          const receiverName = `${receiver.firstName || ''} ${receiver.lastName || ''}`.trim() || receiverEmail;
          const receiverEmailData = emailTemplates.moneyTransfer(receiverName, amount, senderEmail, 'received', receiver.currency || 'USD');
          await sendEmail({
            to: receiverEmail,
            subject: receiverEmailData.subject,
            html: receiverEmailData.html,
            text: receiverEmailData.text
          });
        })()
      ]);

      return NextResponse.json({
        success: true,
        message: 'Transfer completed successfully',
        data: {
          amount,
          fee: transferFee,
          totalDeduction,
          receiverEmail
        }
      });

    } finally {
      await session.endSession();
    }

  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Transfer failed' },
      { status: 500 }
    );
  }
});
