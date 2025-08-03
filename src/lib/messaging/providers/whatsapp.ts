// WhatsApp Business API Integration
// Supports multiple providers: Twilio, Meta Business, etc.

import { MessageProviderType, MessageStatus } from '@prisma/client';

export interface WhatsAppConfig {
  provider: 'twilio' | 'meta' | 'gupshup';
  apiKey: string;
  apiSecret?: string;
  phoneNumberId?: string; // For Meta Business API
  accessToken?: string; // For Meta Business API
  accountSid?: string; // For Twilio
  authToken?: string; // For Twilio
  fromNumber: string; // WhatsApp Business number
}

export interface WhatsAppMessage {
  to: string;
  message: string;
  templateName?: string;
  templateParams?: Record<string, string>;
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  status: MessageStatus;
}

export class WhatsAppProvider {
  private config: WhatsAppConfig;

  constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  /**
   * Send WhatsApp message using configured provider
   */
  async sendMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    try {
      switch (this.config.provider) {
        case 'twilio':
          return await this.sendViaTwilio(message);
        case 'meta':
          return await this.sendViaMeta(message);
        case 'gupshup':
          return await this.sendViaGupshup(message);
        default:
          throw new Error(
            `Unsupported WhatsApp provider: ${this.config.provider}`
          );
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: MessageStatus.FAILED,
      };
    }
  }

  /**
   * Send via Twilio WhatsApp API
   */
  private async sendViaTwilio(
    message: WhatsAppMessage
  ): Promise<WhatsAppResponse> {
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages.json`;

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: `whatsapp:${this.config.fromNumber}`,
        To: `whatsapp:${message.to}`,
        Body: message.message,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        messageId: data.sid,
        status: MessageStatus.SENT,
      };
    } else {
      return {
        success: false,
        error: data.message || 'Failed to send via Twilio',
        status: MessageStatus.FAILED,
      };
    }
  }

  /**
   * Send via Meta WhatsApp Business API
   */
  private async sendViaMeta(
    message: WhatsAppMessage
  ): Promise<WhatsAppResponse> {
    const metaUrl = `https://graph.facebook.com/v18.0/${this.config.phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to: message.to,
      type: 'text',
      text: {
        body: message.message,
      },
    };

    const response = await fetch(metaUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.messages) {
      return {
        success: true,
        messageId: data.messages[0].id,
        status: MessageStatus.SENT,
      };
    } else {
      return {
        success: false,
        error: data.error?.message || 'Failed to send via Meta',
        status: MessageStatus.FAILED,
      };
    }
  }

  /**
   * Send via Gupshup (Popular in South Asia)
   */
  private async sendViaGupshup(
    message: WhatsAppMessage
  ): Promise<WhatsAppResponse> {
    const gupshupUrl = 'https://api.gupshup.io/sm/api/v1/msg';

    const response = await fetch(gupshupUrl, {
      method: 'POST',
      headers: {
        apikey: this.config.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        channel: 'whatsapp',
        source: this.config.fromNumber,
        destination: message.to,
        message: JSON.stringify({
          type: 'text',
          text: message.message,
        }),
      }),
    });

    const data = await response.json();

    if (response.ok && data.status === 'submitted') {
      return {
        success: true,
        messageId: data.messageId,
        status: MessageStatus.SENT,
      };
    } else {
      return {
        success: false,
        error: data.message || 'Failed to send via Gupshup',
        status: MessageStatus.FAILED,
      };
    }
  }

  /**
   * Get message delivery status
   */
  async getMessageStatus(messageId: string): Promise<MessageStatus> {
    try {
      switch (this.config.provider) {
        case 'twilio':
          return await this.getTwilioStatus(messageId);
        case 'meta':
          // Meta provides status via webhooks
          return MessageStatus.SENT;
        case 'gupshup':
          return await this.getGupshupStatus(messageId);
        default:
          return MessageStatus.SENT;
      }
    } catch (error) {
      console.error('Error getting message status:', error);
      return MessageStatus.SENT;
    }
  }

  private async getTwilioStatus(messageId: string): Promise<MessageStatus> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages/${messageId}.json`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64')}`,
      },
    });

    const data = await response.json();

    switch (data.status) {
      case 'delivered':
        return MessageStatus.DELIVERED;
      case 'read':
        return MessageStatus.DELIVERED;
      case 'failed':
      case 'undelivered':
        return MessageStatus.FAILED;
      default:
        return MessageStatus.SENT;
    }
  }

  private async getGupshupStatus(messageId: string): Promise<MessageStatus> {
    // Implement Gupshup status check
    return MessageStatus.SENT;
  }
}
