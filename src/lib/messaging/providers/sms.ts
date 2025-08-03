// SMS Provider Integration
// Supports multiple SMS providers popular in Bangladesh/South Asia

import { MessageStatus } from '@prisma/client';

export interface SMSConfig {
  provider: 'twilio' | 'nexmo' | 'ssl' | 'robi' | 'grameenphone';
  apiKey: string;
  apiSecret?: string;
  accountSid?: string;
  authToken?: string;
  fromNumber: string;
  baseUrl?: string;
}

export interface SMSMessage {
  to: string;
  message: string;
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  status: MessageStatus;
}

export class SMSProvider {
  private config: SMSConfig;

  constructor(config: SMSConfig) {
    this.config = config;
  }

  /**
   * Send SMS using configured provider
   */
  async sendMessage(message: SMSMessage): Promise<SMSResponse> {
    try {
      switch (this.config.provider) {
        case 'twilio':
          return await this.sendViaTwilio(message);
        case 'nexmo':
          return await this.sendViaNexmo(message);
        case 'ssl':
          return await this.sendViaSSL(message);
        case 'robi':
          return await this.sendViaRobi(message);
        case 'grameenphone':
          return await this.sendViaGrameenphone(message);
        default:
          throw new Error(`Unsupported SMS provider: ${this.config.provider}`);
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
   * Send via Twilio SMS API
   */
  private async sendViaTwilio(message: SMSMessage): Promise<SMSResponse> {
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages.json`;

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: this.config.fromNumber,
        To: message.to,
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
   * Send via Vonage (Nexmo) SMS API
   */
  private async sendViaNexmo(message: SMSMessage): Promise<SMSResponse> {
    const nexmoUrl = 'https://rest.nexmo.com/sms/json';

    const response = await fetch(nexmoUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.config.fromNumber,
        to: message.to,
        text: message.message,
        api_key: this.config.apiKey,
        api_secret: this.config.apiSecret,
      }),
    });

    const data = await response.json();

    if (response.ok && data.messages[0].status === '0') {
      return {
        success: true,
        messageId: data.messages[0]['message-id'],
        status: MessageStatus.SENT,
      };
    } else {
      return {
        success: false,
        error: data.messages[0]['error-text'] || 'Failed to send via Nexmo',
        status: MessageStatus.FAILED,
      };
    }
  }

  /**
   * Send via SSL Wireless (Popular in Bangladesh)
   */
  private async sendViaSSL(message: SMSMessage): Promise<SMSResponse> {
    const sslUrl =
      this.config.baseUrl || 'https://smsplus.sslwireless.com/api/v3/send-sms';

    const response = await fetch(sslUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_token: this.config.apiKey,
        sid: this.config.fromNumber,
        sms: message.message,
        msisdn: message.to,
        csms_id: Date.now().toString(),
      }),
    });

    const data = await response.json();

    if (response.ok && data.status === 'SUCCESS') {
      return {
        success: true,
        messageId: data.smsinfo?.csms_id,
        status: MessageStatus.SENT,
      };
    } else {
      return {
        success: false,
        error: data.detail || 'Failed to send via SSL Wireless',
        status: MessageStatus.FAILED,
      };
    }
  }

  /**
   * Send via Robi (Bangladesh telecom)
   */
  private async sendViaRobi(message: SMSMessage): Promise<SMSResponse> {
    // Implement Robi SMS API integration
    const response = await fetch(this.config.baseUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        from: this.config.fromNumber,
        to: message.to,
        text: message.message,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        messageId: data.messageId,
        status: MessageStatus.SENT,
      };
    } else {
      return {
        success: false,
        error: 'Failed to send via Robi',
        status: MessageStatus.FAILED,
      };
    }
  }

  /**
   * Send via Grameenphone (Bangladesh telecom)
   */
  private async sendViaGrameenphone(message: SMSMessage): Promise<SMSResponse> {
    // Implement Grameenphone SMS API integration
    const response = await fetch(this.config.baseUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        from: this.config.fromNumber,
        to: message.to,
        text: message.message,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        messageId: data.messageId,
        status: MessageStatus.SENT,
      };
    } else {
      return {
        success: false,
        error: 'Failed to send via Grameenphone',
        status: MessageStatus.FAILED,
      };
    }
  }
}
