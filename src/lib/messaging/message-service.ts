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
   * Auto-initialize messaging for a tenant if not already set up
   */
  private async ensureTenantMessagingSetup(tenantId: string): Promise<void> {
    try {
      // Check if provider already exists for this tenant
      if (this.whatsappProviders.has(tenantId)) {
        return; // Already set up
      }

      // Check if provider exists in database
      let provider = await prisma.messageProvider.findFirst({
        where: {
          tenantId,
          isActive: true,
          type: MessageProviderType.WHATSAPP_BUSINESS,
        },
      });

      if (!provider) {
        // Auto-create Evolution API provider for this tenant
        console.log(
          `🔧 Auto-creating messaging provider for tenant: ${tenantId}`
        );

        provider = await prisma.messageProvider.create({
          data: {
            tenantId,
            name: 'Evolution API',
            type: MessageProviderType.WHATSAPP_BUSINESS,
            config: {
              provider: 'evolution',
              apiUrl:
                process.env.EVOLUTION_API_URL ||
                'http://evo-p8okkk0840kg40o0o44w4gck.173.249.28.62.sslip.io/',
              apiKey:
                process.env.EVOLUTION_API_KEY ||
                'nJjnWgllihDFnx2FRk3yyIdvi5NUUFl7',
              instanceName: process.env.EVOLUTION_INSTANCE_NAME || 'lpgapp',
              webhookUrl:
                process.env.EVOLUTION_WEBHOOK_URL ||
                'http://localhost:3000/api/messaging/evolution/webhook',
              fromNumber: process.env.EVOLUTION_INSTANCE_NAME || 'lpgapp',
            },
            isActive: true,
            isDefault: true,
          },
        });

        // Create messaging settings
        await prisma.messagingSettings.upsert({
          where: { tenantId },
          update: {
            whatsappEnabled: true,
            receivablesNotificationsEnabled: true,
            paymentNotificationsEnabled: true,
            overdueRemindersEnabled: true,
          },
          create: {
            tenantId,
            whatsappEnabled: true,
            smsEnabled: false,
            emailEnabled: false,
            receivablesNotificationsEnabled: true,
            paymentNotificationsEnabled: true,
            overdueRemindersEnabled: true,
          },
        });

        // Create default templates
        await this.createDefaultTemplates(tenantId, provider.id);

        console.log(`✅ Messaging setup completed for tenant: ${tenantId}`);
      }

      // Initialize provider in memory
      const config = provider.config as unknown as WhatsAppConfig;
      this.whatsappProviders.set(tenantId, new WhatsAppProvider(config));
    } catch (error) {
      console.error(
        `Error setting up messaging for tenant ${tenantId}:`,
        error
      );
    }
  }

  /**
   * Create default message templates for a tenant
   */
  private async createDefaultTemplates(
    tenantId: string,
    providerId: string
  ): Promise<void> {
    const templates = [
      {
        name: 'Customer Receivables Change',
        trigger: MessageTrigger.RECEIVABLES_CHANGE,
        messageType: MessageType.WHATSAPP,
        template: `🔔 *বকেয়া আপডেট*

প্রিয় {{customerName}},

আপনার বকেয়া তথ্য আপডেট হয়েছে:

পুরাতন বকেয়া: {{oldAmount}}
নতুন বকেয়া: {{newAmount}}
পরিবর্তন: {{change}} ({{changeType}})

নগদ বকেয়া: {{cashAmount}}
সিলিন্ডার বকেয়া: {{cylinderAmount}}

এলাকা: {{areaName}}
সময়: {{date}} {{time}}
কারণ: {{changeReason}}

*{{companyName}}*`,
        variables: {
          customerName: 'গ্রাহকের নাম',
          oldAmount: 'পুরাতন বকেয়া',
          newAmount: 'নতুন বকেয়া',
          change: 'পরিবর্তন',
          changeType: 'বৃদ্ধি/হ্রাস',
          cashAmount: 'নগদ বকেয়া',
          cylinderAmount: 'সিলিন্ডার বকেয়া',
          areaName: 'এলাকার নাম',
          date: 'তারিখ',
          time: 'সময়',
          changeReason: 'কারণ',
          companyName: 'কোম্পানির নাম',
        },
      },
      {
        name: 'Payment Received Confirmation',
        trigger: MessageTrigger.PAYMENT_RECEIVED,
        messageType: MessageType.WHATSAPP,
        template: `✅ *পেমেন্ট নিশ্চিতকরণ*

প্রিয় {{customerName}},

আপনার {{amount}} টাকার {{paymentType}} পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে।

গ্রহণকারী: {{receivedBy}}
সময়: {{date}} {{time}}

ধন্যবাদ!

*{{companyName}}*`,
        variables: {
          customerName: 'গ্রাহকের নাম',
          amount: 'পরিমাণ',
          paymentType: 'পেমেন্ট প্রকার',
          receivedBy: 'গ্রহণকারী',
          date: 'তারিখ',
          time: 'সময়',
          companyName: 'কোম্পানির নাম',
        },
      },
      {
        name: 'Overdue Reminder',
        trigger: MessageTrigger.OVERDUE_REMINDER,
        messageType: MessageType.WHATSAPP,
        template: `⚠️ *বকেয়া মনে করিয়ে দিন*

প্রিয় {{customerName}},

আপনার মোট বকেয়া {{amount}} টাকা।
বকেয়ার মেয়াদ: {{daysOverdue}} দিন

নগদ বকেয়া: {{cashAmount}}
সিলিন্ডার বকেয়া: {{cylinderAmount}}

অনুগ্রহ করে যত তাড়াতাড়ি সম্ভব পরিশোধ করুন।
যোগাযোগ: {{contactNumber}}

*{{companyName}}*`,
        variables: {
          customerName: 'গ্রাহকের নাম',
          amount: 'মোট বকেয়া',
          daysOverdue: 'বকেয়ার দিন',
          cashAmount: 'নগদ বকেয়া',
          cylinderAmount: 'সিলিন্ডার বকেয়া',
          contactNumber: 'যোগাযোগ নম্বর',
          companyName: 'কোম্পানির নাম',
        },
      },
    ];

    for (const template of templates) {
      await prisma.messageTemplate.upsert({
        where: {
          tenantId_trigger_messageType: {
            tenantId,
            trigger: template.trigger,
            messageType: template.messageType,
          },
        },
        update: {
          name: template.name,
          template: template.template,
          variables: template.variables,
          isActive: true,
        },
        create: {
          tenantId,
          providerId,
          name: template.name,
          trigger: template.trigger,
          messageType: template.messageType,
          template: template.template,
          variables: template.variables,
          isActive: true,
          isDefault: true,
        },
      });
    }
  }

  /**
   * Send message for receivables update
   */
  async sendReceivablesMessage(data: MessageData): Promise<boolean> {
    try {
      // Ensure messaging is set up for this tenant
      await this.ensureTenantMessagingSetup(data.tenantId);

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
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
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
            errorMessage:
              error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }
  }
}
