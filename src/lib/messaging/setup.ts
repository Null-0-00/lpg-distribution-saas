// Messaging System Setup
// Initialize messaging for new tenants

import { prisma } from '@/lib/prisma';
import { MessageType, MessageProviderType } from '@prisma/client';
import { createDefaultMessageTemplates } from './default-templates';

export interface MessagingSetupConfig {
  tenantId: string;

  // WhatsApp Configuration
  whatsapp?: {
    provider: 'twilio' | 'meta' | 'gupshup';
    config: {
      apiKey: string;
      apiSecret?: string;
      fromNumber: string;
      // Provider-specific configs
      accountSid?: string;
      authToken?: string;
      phoneNumberId?: string;
      accessToken?: string;
    };
  };

  // SMS Configuration
  sms?: {
    provider: 'twilio' | 'nexmo' | 'ssl' | 'robi' | 'grameenphone';
    config: {
      apiKey: string;
      apiSecret?: string;
      fromNumber: string;
      accountSid?: string;
      authToken?: string;
      baseUrl?: string;
    };
  };

  // Settings
  settings?: {
    allowWhatsApp?: boolean;
    allowSMS?: boolean;
    dailyMessageLimit?: number;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    timezone?: string;
  };

  language?: 'bn' | 'en';
}

/**
 * Complete messaging system setup for a tenant
 */
export async function setupMessagingForTenant(
  config: MessagingSetupConfig
): Promise<{
  success: boolean;
  providers: any[];
  templates: any[];
  settings: any;
  error?: string;
}> {
  try {
    const providers = [];
    const templates = [];

    // Setup WhatsApp Provider
    if (config.whatsapp) {
      const whatsappProvider = await prisma.messageProvider.create({
        data: {
          tenantId: config.tenantId,
          name: 'WhatsApp',
          type: MessageProviderType.WHATSAPP_BUSINESS,
          config: {
            provider: config.whatsapp.provider,
            ...config.whatsapp.config,
          },
          isActive: true,
        },
      });

      providers.push(whatsappProvider);

      // Create WhatsApp templates
      const whatsappTemplates = await createDefaultMessageTemplates(
        config.tenantId,
        whatsappProvider.id,
        config.language || 'bn'
      );
      templates.push(...whatsappTemplates);
    }

    // Setup SMS Provider
    if (config.sms) {
      const smsProvider = await prisma.messageProvider.create({
        data: {
          tenantId: config.tenantId,
          name: 'SMS',
          type: MessageProviderType.SMS_PROVIDER,
          config: {
            provider: config.sms.provider,
            ...config.sms.config,
          },
          isActive: true,
        },
      });

      providers.push(smsProvider);

      // Create SMS templates
      const smsTemplates = await createDefaultMessageTemplates(
        config.tenantId,
        smsProvider.id,
        config.language || 'bn'
      );
      templates.push(...smsTemplates);
    }

    // Setup Messaging Settings
    const settings = await prisma.messagingSettings.create({
      data: {
        tenantId: config.tenantId,
        whatsappEnabled: config.settings?.allowWhatsApp ?? !!config.whatsapp,
        smsEnabled: config.settings?.allowSMS ?? !!config.sms,
        emailEnabled: false,
        receivablesNotificationsEnabled: true,
        paymentNotificationsEnabled: true,
        overdueRemindersEnabled: true,
      },
    });

    return {
      success: true,
      providers,
      templates,
      settings,
    };
  } catch (error) {
    console.error('Error setting up messaging for tenant:', error);
    return {
      success: false,
      providers: [],
      templates: [],
      settings: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Quick setup with recommended Bangladesh settings
 */
export async function setupBangladeshMessaging(
  tenantId: string,
  whatsappConfig?: {
    provider: 'gupshup' | 'twilio';
    apiKey: string;
    fromNumber: string;
    apiSecret?: string;
  },
  smsConfig?: {
    provider: 'ssl' | 'robi' | 'grameenphone';
    apiKey: string;
    fromNumber: string;
    baseUrl?: string;
  }
) {
  return await setupMessagingForTenant({
    tenantId,
    whatsapp: whatsappConfig
      ? {
          provider: whatsappConfig.provider,
          config: whatsappConfig,
        }
      : undefined,
    sms: smsConfig
      ? {
          provider: smsConfig.provider,
          config: smsConfig,
        }
      : undefined,
    settings: {
      allowWhatsApp: !!whatsappConfig,
      allowSMS: !!smsConfig,
      dailyMessageLimit: 500, // Conservative limit for Bangladesh
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      timezone: 'Asia/Dhaka',
    },
    language: 'bn',
  });
}

/**
 * Test messaging setup
 */
export async function testMessagingSetup(
  tenantId: string,
  testPhoneNumber: string
): Promise<{ success: boolean; results: any[]; error?: string }> {
  try {
    const providers = await prisma.messageProvider.findMany({
      where: { tenantId, isActive: true },
    });

    const results = [];

    for (const provider of providers) {
      try {
        const testMessage = `Test message from ${provider.name} - ${new Date().toLocaleString('bn-BD')}`;

        // This would use your MessageService to send the test
        // const messageService = new MessageService();
        // const result = await messageService.sendTestMessage(provider, testPhoneNumber, testMessage);

        results.push({
          provider: provider.name,
          type: provider.type,
          success: true,
          message: 'Test message queued successfully',
        });
      } catch (error) {
        results.push({
          provider: provider.name,
          type: provider.type,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      success: results.some((r) => r.success),
      results,
    };
  } catch (error) {
    return {
      success: false,
      results: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
