// Core Messaging Service
// Handles template rendering, queuing, and sending messages

import { prisma } from '@/lib/prisma';
import { WhatsAppProvider, WhatsAppConfig } from './providers/whatsapp';
import { SMSProvider, SMSConfig } from './providers/sms';
import {
  MessageType,
  MessageTrigger,
  RecipientType,
  MessageStatus,
  MessageProviderType,
} from '@prisma/client';

export interface MessageData {
  tenantId: string;
  recipientType: RecipientType;
  recipientId: string;
  recipientPhone: string;
  recipientName: string;
  triggerType: MessageTrigger;
  triggerData: any;
  language?: string;
}

export interface TemplateVariables {
  driverName: string;
  amount: string;
  oldAmount: string;
  newAmount: string;
  change: string;
  changeType: 'increase' | 'decrease';
  date: string;
  time: string;
  companyName?: string;
  [key: string]: any;
}

export class MessageService {
  private whatsappProviders: Map<string, WhatsAppProvider> = new Map();
  private smsProviders: Map<string, SMSProvider> = new Map();

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize message providers from database
   */
  private async initializeProviders() {
    const providers = await prisma.messageProvider.findMany({
      where: { isActive: true },
    });

    for (const provider of providers) {
      const config = provider.config as any;

      if (provider.type === MessageProviderType.WHATSAPP_BUSINESS) {
        this.whatsappProviders.set(
          provider.tenantId,
          new WhatsAppProvider(config as WhatsAppConfig)
        );
      } else if (provider.type === MessageProviderType.SMS_PROVIDER) {
        this.smsProviders.set(
          provider.tenantId,
          new SMSProvider(config as SMSConfig)
        );
      }
    }
  }

  /**
   * Send message for receivables update
   */
  async sendReceivablesMessage(data: MessageData): Promise<boolean> {
    try {
      // Check messaging settings
      const settings = await prisma.messagingSettings.findUnique({
        where: { tenantId: data.tenantId },
      });

      if (!settings || !settings.receivablesNotificationsEnabled) {
        console.log('Messaging disabled for tenant:', data.tenantId);
        return false;
      }

      // Note: Quiet hours removed - not in current schema

      // Find appropriate template
      const template = await this.findTemplate(
        data.tenantId,
        data.triggerType,
        data.language || 'bn'
      );
      if (!template) {
        console.log('No template found for trigger:', data.triggerType);
        return false;
      }

      // Render message content
      const messageContent = this.renderTemplate(
        template.template,
        data.triggerData
      );

      // Determine message type based on settings and availability
      const messageType = template.messageType;

      // Send message
      const result = await this.sendMessage({
        tenantId: data.tenantId,
        templateId: template.id,
        providerId: template.providerId,
        messageType,
        recipientPhone: data.recipientPhone,
        recipientName: data.recipientName,
        messageContent,
        data,
      });

      return result.success;
    } catch (error) {
      console.error('Error sending receivables message:', error);
      return false;
    }
  }

  /**
   * Find appropriate message template
   */
  private async findTemplate(
    tenantId: string,
    triggerType: MessageTrigger,
    language: string
  ) {
    return await prisma.messageTemplate.findFirst({
      where: {
        tenantId,
        trigger: triggerType,
        isActive: true,
      },
      include: {
        provider: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Render template with variables
   */
  private renderTemplate(
    template: string,
    variables: TemplateVariables
  ): string {
    let rendered = template;

    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, String(value));
    });

    return rendered;
  }

  /**
   * Send message via appropriate provider
   */
  private async sendMessage(params: {
    tenantId: string;
    templateId: string;
    providerId: string;
    messageType: MessageType;
    recipientPhone: string;
    recipientName: string;
    messageContent: string;
    data: MessageData;
  }) {
    const {
      tenantId,
      templateId,
      providerId,
      messageType,
      recipientPhone,
      messageContent,
      data,
    } = params;

    try {
      let result;

      if (messageType === MessageType.WHATSAPP) {
        const provider = this.whatsappProviders.get(tenantId);
        if (!provider) throw new Error('WhatsApp provider not found');

        result = await provider.sendMessage({
          to: recipientPhone,
          message: messageContent,
        });
      } else if (messageType === MessageType.SMS) {
        const provider = this.smsProviders.get(tenantId);
        if (!provider) throw new Error('SMS provider not found');

        result = await provider.sendMessage({
          to: recipientPhone,
          message: messageContent,
        });
      } else {
        throw new Error('Unsupported message type');
      }

      // Save message record
      await prisma.sentMessage.create({
        data: {
          tenantId,
          templateId,
          providerId,
          recipientType: data.recipientType,
          recipientId: data.recipientId,
          phoneNumber: recipientPhone,
          message: messageContent,
          trigger: data.triggerType,
          messageType,
          metadata: data.triggerData,
          status: result.status,
          sentAt: result.success ? new Date() : null,
          errorMessage: result.error,
        },
      });

      return result;
    } catch (error) {
      console.error('Error sending message:', error);

      // Save failed message record
      await prisma.sentMessage.create({
        data: {
          tenantId,
          templateId,
          providerId,
          recipientType: data.recipientType,
          recipientId: data.recipientId,
          phoneNumber: recipientPhone,
          message: messageContent,
          trigger: data.triggerType,
          messageType,
          metadata: data.triggerData,
          status: MessageStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Queue message for later sending (during quiet hours)
   */
  private async queueMessage(data: MessageData): Promise<boolean> {
    // Implementation for queuing messages
    // This could use a job queue like Bull/BullMQ or simple database scheduling
    return true;
  }

  /**
   * Check if current time is within quiet hours
   */
  private isQuietTime(
    startTime?: string,
    endTime?: string,
    timezone?: string
  ): boolean {
    if (!startTime || !endTime) return false;

    const now = new Date();
    const start = this.parseTime(startTime);
    const end = this.parseTime(endTime);
    const currentTime = now.getHours() * 60 + now.getMinutes();

    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    } else {
      // Quiet hours span midnight
      return currentTime >= start || currentTime <= end;
    }
  }

  /**
   * Parse time string (HH:MM) to minutes
   */
  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Determine best message type based on settings and availability
   */
  private determineMessageType(
    settings: any,
    providerType: MessageType
  ): MessageType {
    if (providerType === MessageType.WHATSAPP && settings.allowWhatsApp) {
      return MessageType.WHATSAPP;
    } else if (providerType === MessageType.SMS && settings.allowSMS) {
      return MessageType.SMS;
    }

    // Fallback logic
    if (settings.allowWhatsApp) return MessageType.WHATSAPP;
    if (settings.allowSMS) return MessageType.SMS;

    return providerType;
  }

  /**
   * Process message queue (to be called by cron job)
   */
  async processMessageQueue(): Promise<void> {
    const pendingMessages = await prisma.sentMessage.findMany({
      where: {
        status: MessageStatus.PENDING,
        // Get pending messages for retry
      },
      include: {
        template: { include: { provider: true } },
      },
      take: 100,
    });

    for (const message of pendingMessages) {
      try {
        // Retry sending the message
        const result = await this.sendMessage({
          tenantId: message.tenantId,
          templateId: message.templateId || '',
          providerId: message.providerId,
          messageType: message.template?.provider.type as any,
          recipientPhone: message.phoneNumber,
          recipientName: message.phoneNumber, // Use phone as name fallback
          messageContent: message.message,
          data: {
            tenantId: message.tenantId,
            recipientType: message.recipientType,
            recipientId: message.recipientId || '',
            recipientPhone: message.phoneNumber,
            recipientName: message.phoneNumber, // Use phone as name fallback
            triggerType: message.trigger,
            triggerData: message.metadata,
          },
        });

        // Update message status
        await prisma.sentMessage.update({
          where: { id: message.id },
          data: {
            status: result.success ? MessageStatus.SENT : MessageStatus.FAILED,
            sentAt: result.success ? new Date() : message.sentAt,
            // Note: retryCount field removed from schema
            errorMessage: result.error,
          },
        });
      } catch (error) {
        console.error('Error processing queued message:', error);

        await prisma.sentMessage.update({
          where: { id: message.id },
          data: {
            // Note: retryCount field removed from schema
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }
  }
}
