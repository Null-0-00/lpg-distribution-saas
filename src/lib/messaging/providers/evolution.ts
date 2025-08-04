// Evolution API WhatsApp Integration
// Handles WhatsApp messaging through Evolution API

import { MessageStatus } from '@prisma/client';

export interface EvolutionConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
  webhookUrl?: string;
}

export interface EvolutionMessage {
  to: string;
  message: string;
  instanceName?: string;
}

export interface EvolutionResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  status: MessageStatus;
}

export class EvolutionProvider {
  private config: EvolutionConfig;

  constructor(config: EvolutionConfig) {
    this.config = config;
  }

  /**
   * Send WhatsApp message via Evolution API
   */
  async sendMessage(message: EvolutionMessage): Promise<EvolutionResponse> {
    try {
      const instanceName = message.instanceName || this.config.instanceName;
      // Clean URL construction - remove trailing slash from apiUrl if present
      const baseUrl = this.config.apiUrl.endsWith('/')
        ? this.config.apiUrl.slice(0, -1)
        : this.config.apiUrl;
      const url = `${baseUrl}/message/sendText/${instanceName}`;

      // Format phone number (ensure it starts with country code)
      const formattedPhone = this.formatPhoneNumber(message.to);

      const payload = {
        number: formattedPhone,
        text: message.message,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: this.config.apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.key) {
        return {
          success: true,
          messageId: data.key.id,
          status: MessageStatus.SENT,
        };
      } else {
        return {
          success: false,
          error:
            data.message ||
            data.error ||
            'Failed to send message via Evolution API',
          status: MessageStatus.FAILED,
        };
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
   * Format phone number for Evolution API
   * Ensures phone number has country code (Bangladesh: +880)
   */
  private formatPhoneNumber(phone: string): string {
    // Remove any non-numeric characters except +
    const formatted = phone.replace(/[^\d+]/g, '');

    // If it starts with +, keep it
    if (formatted.startsWith('+')) {
      return formatted;
    }

    // If it starts with 880, add +
    if (formatted.startsWith('880')) {
      return `+${formatted}`;
    }

    // If it starts with 0, replace with +880
    if (formatted.startsWith('0')) {
      return `+880${formatted.substring(1)}`;
    }

    // If it's a local number (starts with 1), add +880
    if (formatted.startsWith('1') && formatted.length === 11) {
      return `+880${formatted}`;
    }

    // Default: assume it needs +880 prefix
    return `+880${formatted}`;
  }

  /**
   * Get instance status
   */
  async getInstanceStatus(instanceName?: string): Promise<boolean> {
    try {
      const instance = instanceName || this.config.instanceName;
      const url = `${this.config.apiUrl}/instance/fetchInstances`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          apikey: this.config.apiKey,
        },
      });

      const data = await response.json();

      if (Array.isArray(data)) {
        const instanceData = data.find(
          (inst) => inst.instance.instanceName === instance
        );
        return instanceData?.instance?.state === 'open';
      }

      return false;
    } catch (error) {
      console.error('Error checking Evolution API instance status:', error);
      return false;
    }
  }

  /**
   * Get connection status (QR code if needed)
   */
  async getConnectionStatus(instanceName?: string): Promise<{
    connected: boolean;
    qrCode?: string;
    status: string;
  }> {
    try {
      const instance = instanceName || this.config.instanceName;
      const url = `${this.config.apiUrl}/instance/connect/${instance}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          apikey: this.config.apiKey,
        },
      });

      const data = await response.json();

      return {
        connected: data.instance?.state === 'open',
        qrCode: data.qrcode?.base64,
        status: data.instance?.state || 'unknown',
      };
    } catch (error) {
      console.error('Error getting Evolution API connection status:', error);
      return {
        connected: false,
        status: 'error',
      };
    }
  }

  /**
   * Create or update instance
   */
  async setupInstance(instanceName?: string): Promise<boolean> {
    try {
      const instance = instanceName || this.config.instanceName;
      const url = `${this.config.apiUrl}/instance/create`;

      const payload = {
        instanceName: instance,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
        webhookUrl: this.config.webhookUrl,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: this.config.apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      return response.ok && data.instance;
    } catch (error) {
      console.error('Error setting up Evolution API instance:', error);
      return false;
    }
  }

  /**
   * Send media message (images, documents, etc.)
   */
  async sendMediaMessage(params: {
    to: string;
    mediaUrl: string;
    mediaType: 'image' | 'document' | 'audio' | 'video';
    caption?: string;
    fileName?: string;
  }): Promise<EvolutionResponse> {
    try {
      const instanceName = this.config.instanceName;
      // Clean URL construction - remove trailing slash from apiUrl if present
      const baseUrl = this.config.apiUrl.endsWith('/')
        ? this.config.apiUrl.slice(0, -1)
        : this.config.apiUrl;
      const url = `${baseUrl}/message/sendMedia/${instanceName}`;

      const formattedPhone = this.formatPhoneNumber(params.to);

      const payload = {
        number: formattedPhone,
        mediaMessage: {
          mediatype: params.mediaType,
          media: params.mediaUrl,
          caption: params.caption || '',
          fileName: params.fileName,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: this.config.apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.key) {
        return {
          success: true,
          messageId: data.key.id,
          status: MessageStatus.SENT,
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to send media message',
          status: MessageStatus.FAILED,
        };
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
   * Get message delivery status (if supported by webhook)
   */
  async getMessageStatus(messageId: string): Promise<MessageStatus> {
    // Evolution API typically provides delivery status via webhooks
    // For now, return SENT as default
    return MessageStatus.SENT;
  }
}
