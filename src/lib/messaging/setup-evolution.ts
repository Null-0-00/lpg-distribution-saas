// Evolution API Setup and Integration
// Sets up Evolution API provider and default templates

import { prisma } from '@/lib/prisma';
import {
  MessageProviderType,
  MessageType,
  MessageTrigger,
} from '@prisma/client';

export interface EvolutionSetupConfig {
  tenantId: string;
  apiUrl: string;
  apiKey: string;
  instanceName: string;
  webhookUrl?: string;
}

/**
 * Setup Evolution API provider for a tenant
 */
export async function setupEvolutionProvider(config: EvolutionSetupConfig) {
  try {
    // Create or update Evolution API provider
    const provider = await prisma.messageProvider.upsert({
      where: {
        tenantId_name: {
          tenantId: config.tenantId,
          name: 'Evolution API',
        },
      },
      update: {
        config: {
          provider: 'evolution',
          apiUrl: config.apiUrl,
          apiKey: config.apiKey,
          instanceName: config.instanceName,
          webhookUrl: config.webhookUrl,
          fromNumber: config.instanceName, // Use instance name as identifier
        },
        isActive: true,
        isDefault: true,
      },
      create: {
        tenantId: config.tenantId,
        name: 'Evolution API',
        type: MessageProviderType.WHATSAPP_BUSINESS,
        config: {
          provider: 'evolution',
          apiUrl: config.apiUrl,
          apiKey: config.apiKey,
          instanceName: config.instanceName,
          webhookUrl: config.webhookUrl,
          fromNumber: config.instanceName,
        },
        isActive: true,
        isDefault: true,
      },
    });

    // Create default message templates
    await createDefaultTemplates(config.tenantId, provider.id);

    // Setup messaging settings
    await prisma.messagingSettings.upsert({
      where: { tenantId: config.tenantId },
      update: {
        whatsappEnabled: true,
        receivablesNotificationsEnabled: true,
        paymentNotificationsEnabled: true,
        overdueRemindersEnabled: true,
      },
      create: {
        tenantId: config.tenantId,
        whatsappEnabled: true,
        smsEnabled: false,
        emailEnabled: false,
        receivablesNotificationsEnabled: true,
        paymentNotificationsEnabled: true,
        overdueRemindersEnabled: true,
      },
    });

    return {
      success: true,
      providerId: provider.id,
      message: 'Evolution API provider setup successfully',
    };
  } catch (error) {
    console.error('Error setting up Evolution API provider:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create default WhatsApp message templates for receivables
 */
async function createDefaultTemplates(tenantId: string, providerId: string) {
  const templates = [
    {
      name: 'Receivables Change Notification',
      trigger: MessageTrigger.RECEIVABLES_CHANGE,
      messageType: MessageType.WHATSAPP,
      template: `🔔 *বকেয়া আপডেট*

{{driverName}} ভাই,
আপনার আজকের বকেয়া {{changeType}} {{change}} টাকা

পুরাতন বকেয়া: {{oldAmount}}
নতুন বকেয়া: {{newAmount}}
পরিবর্তন: {{change}}

সময়: {{date}} {{time}}
কারণ: {{changeReason}}

*এলপিজি ডিস্ট্রিবিউটর সিস্টেম*`,
      variables: {
        driverName: 'চালকের নাম',
        amount: 'পরিমাণ',
        oldAmount: 'পুরাতন বকেয়া',
        newAmount: 'নতুন বকেয়া',
        change: 'পরিবর্তন',
        changeType: 'বৃদ্ধি/হ্রাস',
        date: 'তারিখ',
        time: 'সময়',
        changeReason: 'পরিবর্তনের কারণ',
      },
    },
    {
      name: 'Payment Received Confirmation',
      trigger: MessageTrigger.PAYMENT_RECEIVED,
      messageType: MessageType.WHATSAPP,
      template: `✅ *পেমেন্ট সফল*

{{driverName}} ভাই,
আপনার {{amount}} টাকার {{paymentType}} পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে।

সময়: {{date}} {{time}}

ধন্যবাদ!

*এলপিজি ডিস্ট্রিবিউটর সিস্টেম*`,
      variables: {
        driverName: 'চালকের নাম',
        amount: 'পরিমাণ',
        paymentType: 'পেমেন্ট প্রকার',
        date: 'তারিখ',
        time: 'সময়',
      },
    },
    {
      name: 'Cylinder Return Reminder',
      trigger: MessageTrigger.CYLINDER_RETURN,
      messageType: MessageType.WHATSAPP,
      template: `🔄 *সিলিন্ডার ফেরত*

{{driverName}} ভাই,
আপনার {{cylinderChange}} টি সিলিন্ডার ফেরত প্রক্রিয়া আপডেট হয়েছে।

মোট সিলিন্ডার বকেয়া: {{newAmount}}

সময়: {{date}} {{time}}

*এলপিজি ডিস্ট্রিবিউটর সিস্টেম*`,
      variables: {
        driverName: 'চালকের নাম',
        cylinderChange: 'সিলিন্ডার পরিবর্তন',
        newAmount: 'নতুন বকেয়া',
        date: 'তারিখ',
        time: 'সময়',
      },
    },
    {
      name: 'Overdue Reminder',
      trigger: MessageTrigger.OVERDUE_REMINDER,
      messageType: MessageType.WHATSAPP,
      template: `⚠️ *বকেয়া মনে করিয়ে দিন*

{{driverName}} ভাই,
আপনার মোট বকেয়া {{amount}} টাকা।

নগদ বকেয়া: {{cashAmount}}
সিলিন্ডার বকেয়া: {{cylinderAmount}}

অনুগ্রহ করে যত তাড়াতাড়ি সম্ভব পরিশোধ করুন।

*এলপিজি ডিস্ট্রিবিউটর সিস্টেম*`,
      variables: {
        driverName: 'চালকের নাম',
        amount: 'মোট বকেয়া',
        cashAmount: 'নগদ বকেয়া',
        cylinderAmount: 'সিলিন্ডার বকেয়া',
      },
    },
    {
      name: 'Sale Confirmation',
      trigger: MessageTrigger.SALE_CONFIRMATION,
      messageType: MessageType.WHATSAPP,
      template: `📋 *বিক্রয় নিশ্চিতকরণ*

{{driverName}} ভাই,
আজকের বিক্রয় তথ্য:

মোট বিক্রয়: {{totalSales}} টাকা
জমা: {{deposits}} টাকা
বকেয়া: {{receivables}} টাকা

সময়: {{date}} {{time}}

*এলপিজি ডিস্ট্রিবিউটর সিস্টেম*`,
      variables: {
        driverName: 'চালকের নাম',
        totalSales: 'মোট বিক্রয়',
        deposits: 'জমা',
        receivables: 'বকেয়া',
        date: 'তারিখ',
        time: 'সময়',
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
        isDefault: true,
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
 * Get Evolution API connection status
 */
export async function getEvolutionStatus(tenantId: string) {
  try {
    const provider = await prisma.messageProvider.findFirst({
      where: {
        tenantId,
        type: MessageProviderType.WHATSAPP_BUSINESS,
        isActive: true,
      },
    });

    if (!provider) {
      return {
        connected: false,
        error: 'Evolution API provider not found',
      };
    }

    const config = provider.config as any;
    if (config.provider !== 'evolution') {
      return {
        connected: false,
        error: 'Provider is not Evolution API',
      };
    }

    // Import and check Evolution provider status
    const { EvolutionProvider } = await import('./providers/evolution');
    const evolutionProvider = new EvolutionProvider({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      instanceName: config.instanceName,
      webhookUrl: config.webhookUrl,
    });

    const status = await evolutionProvider.getConnectionStatus();

    return {
      connected: status.connected,
      status: status.status,
      qrCode: status.qrCode,
      instanceName: config.instanceName,
      providerId: provider.id,
    };
  } catch (error) {
    console.error('Error getting Evolution status:', error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test Evolution API by sending a test message
 */
export async function testEvolutionAPI(
  tenantId: string,
  testPhoneNumber: string
) {
  try {
    const provider = await prisma.messageProvider.findFirst({
      where: {
        tenantId,
        type: MessageProviderType.WHATSAPP_BUSINESS,
        isActive: true,
      },
    });

    if (!provider) {
      throw new Error('Evolution API provider not found');
    }

    const config = provider.config as any;
    const { EvolutionProvider } = await import('./providers/evolution');
    const evolutionProvider = new EvolutionProvider({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      instanceName: config.instanceName,
      webhookUrl: config.webhookUrl,
    });

    const testMessage = `🧪 *টেস্ট মেসেজ*

এটি একটি টেস্ট মেসেজ Evolution API থেকে।

সময়: ${new Date().toLocaleString('bn-BD')}

*এলপিজি ডিস্ট্রিবিউটর সিস্টেম*`;

    const result = await evolutionProvider.sendMessage({
      to: testPhoneNumber,
      message: testMessage,
    });

    // Log the test message
    await prisma.sentMessage.create({
      data: {
        tenantId,
        providerId: provider.id,
        recipientType: 'ADMIN',
        phoneNumber: testPhoneNumber,
        message: testMessage,
        trigger: MessageTrigger.MANUAL,
        messageType: MessageType.WHATSAPP,
        status: result.status,
        metadata: { test: true, messageId: result.messageId },
        sentAt: result.success ? new Date() : null,
        errorMessage: result.error,
      },
    });

    return result;
  } catch (error) {
    console.error('Error testing Evolution API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
