import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MessageStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('Evolution webhook received:', JSON.stringify(body, null, 2));

    // Handle different types of Evolution API events
    const { event, data } = body;

    switch (event) {
      case 'messages.upsert':
        await handleMessageUpsert(data);
        break;
      case 'messages.update':
        await handleMessageUpdate(data);
        break;
      case 'connection.update':
        await handleConnectionUpdate(data);
        break;
      default:
        console.log('Unhandled Evolution webhook event:', event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Evolution webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle message upsert events (new messages)
 */
async function handleMessageUpsert(data: any) {
  try {
    if (!data.messages || !Array.isArray(data.messages)) {
      return;
    }

    for (const message of data.messages) {
      // Only process outgoing messages (sent by us)
      if (!message.key?.fromMe) {
        continue;
      }

      const messageId = message.key?.id;
      if (!messageId) {
        continue;
      }

      // Update message status in database
      await prisma.sentMessage.updateMany({
        where: {
          OR: [
            { metadata: { path: ['evolutionMessageId'], equals: messageId } },
            { metadata: { path: ['messageId'], equals: messageId } },
          ],
        },
        data: {
          status: MessageStatus.SENT,
          sentAt: new Date(),
        },
      });

      console.log(`Updated message status for Evolution message: ${messageId}`);
    }
  } catch (error) {
    console.error('Error handling message upsert:', error);
  }
}

/**
 * Handle message update events (delivery status)
 */
async function handleMessageUpdate(data: any) {
  try {
    if (!data.messages || !Array.isArray(data.messages)) {
      return;
    }

    for (const message of data.messages) {
      const messageId = message.key?.id;
      const status = message.update?.status;

      if (!messageId || !status) {
        continue;
      }

      let messageStatus: MessageStatus;
      switch (status) {
        case 1: // PENDING
          messageStatus = MessageStatus.PENDING;
          break;
        case 2: // SERVER_ACK
          messageStatus = MessageStatus.SENT;
          break;
        case 3: // DELIVERY_ACK
          messageStatus = MessageStatus.DELIVERED;
          break;
        case 4: // READ
          messageStatus = MessageStatus.DELIVERED;
          break;
        case 5: // ERROR
          messageStatus = MessageStatus.FAILED;
          break;
        default:
          messageStatus = MessageStatus.SENT;
      }

      // Update message status in database
      await prisma.sentMessage.updateMany({
        where: {
          OR: [
            { metadata: { path: ['evolutionMessageId'], equals: messageId } },
            { metadata: { path: ['messageId'], equals: messageId } },
          ],
        },
        data: {
          status: messageStatus,
          deliveredAt:
            messageStatus === MessageStatus.DELIVERED ? new Date() : undefined,
          failedAt:
            messageStatus === MessageStatus.FAILED ? new Date() : undefined,
        },
      });

      console.log(
        `Updated message status for Evolution message ${messageId}: ${messageStatus}`
      );
    }
  } catch (error) {
    console.error('Error handling message update:', error);
  }
}

/**
 * Handle connection status updates
 */
async function handleConnectionUpdate(data: any) {
  try {
    const { state, instance } = data;

    console.log(`Evolution instance ${instance} connection state: ${state}`);

    // You could store connection status in database if needed
    // For now, just log it
  } catch (error) {
    console.error('Error handling connection update:', error);
  }
}
