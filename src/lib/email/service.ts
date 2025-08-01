/**
 * Email Service
 *
 * Abstracted email service that can work with multiple providers
 */

import * as nodemailer from 'nodemailer';
import {
  getEmailConfig,
  validateEmailConfig,
  type EmailProviderConfig,
} from './config';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private config: EmailProviderConfig;
  private transporter?: nodemailer.Transporter;

  constructor() {
    this.config = getEmailConfig();
    this.validateConfig();
    this.initializeTransporter();
  }

  private validateConfig() {
    const errors = validateEmailConfig(this.config);
    if (errors.length > 0) {
      console.warn('Email configuration warnings:', errors);
      // In development, log warnings but don't throw
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Email configuration errors: ${errors.join(', ')}`);
      }
    }
  }

  private initializeTransporter() {
    if (this.config.provider === 'smtp') {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth:
          this.config.username && this.config.password
            ? {
                user: this.config.username,
                pass: this.config.password,
              }
            : undefined,
        // Disable SSL verification in development
        tls:
          process.env.NODE_ENV === 'development'
            ? {
                rejectUnauthorized: false,
              }
            : undefined,
      });
    }
  }

  async sendEmail(message: EmailMessage): Promise<EmailResult> {
    try {
      switch (this.config.provider) {
        case 'resend':
          return await this.sendWithResend(message);

        case 'sendgrid':
          return await this.sendWithSendGrid(message);

        case 'smtp':
          return await this.sendWithSMTP(message);

        default:
          throw new Error(
            `Unsupported email provider: ${(this.config as any).provider}`
          );
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async sendWithResend(message: EmailMessage): Promise<EmailResult> {
    if (this.config.provider !== 'resend') {
      throw new Error('Invalid provider for sendWithResend');
    }

    // Dynamically import Resend to avoid bundling if not used
    const { Resend } = await import('resend');
    const resend = new Resend(this.config.apiKey);

    const result = await resend.emails.send({
      from: `${this.config.fromName} <${this.config.from}>`,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      replyTo: this.config.replyTo,
    });

    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    return {
      success: true,
      messageId: result.data?.id,
    };
  }

  private async sendWithSendGrid(message: EmailMessage): Promise<EmailResult> {
    if (this.config.provider !== 'sendgrid') {
      throw new Error('Invalid provider for sendWithSendGrid');
    }

    // Dynamically import SendGrid to avoid bundling if not used
    const sgMailModule = await import('@sendgrid/mail');
    const sgMail =
      'default' in sgMailModule ? sgMailModule.default : sgMailModule;
    (sgMail as any).setApiKey(this.config.apiKey);

    const msg = {
      to: message.to,
      from: {
        email: this.config.from,
        name: this.config.fromName,
      },
      subject: message.subject,
      html: message.html,
      text: message.text,
      replyTo: this.config.replyTo,
    };

    const result = await (sgMail as any).send(msg);

    return {
      success: true,
      messageId: result[0]?.headers?.['x-message-id'] as string,
    };
  }

  private async sendWithSMTP(message: EmailMessage): Promise<EmailResult> {
    if (!this.transporter) {
      throw new Error('SMTP transporter not initialized');
    }

    const result = await this.transporter.sendMail({
      from: `${this.config.fromName} <${this.config.from}>`,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      replyTo: this.config.replyTo,
    });

    return {
      success: true,
      messageId: result.messageId,
    };
  }

  // Test email connectivity
  async testConnection(): Promise<EmailResult> {
    try {
      if (this.config.provider === 'smtp' && this.transporter) {
        await this.transporter.verify();
        return { success: true };
      }

      // For API-based providers, send a test email to a test address
      return await this.sendEmail({
        to: 'test@example.com',
        subject: 'Test Connection',
        html: '<p>This is a test email to verify connectivity.</p>',
        text: 'This is a test email to verify connectivity.',
      });
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Connection test failed',
      };
    }
  }
}

// Singleton instance
let emailService: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailService) {
    emailService = new EmailService();
  }
  return emailService;
}

// Convenience function for sending emails
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const service = getEmailService();
  return await service.sendEmail(message);
}

// Development helper - mock email service for testing
export class MockEmailService {
  private sentEmails: (EmailMessage & { sentAt: Date })[] = [];

  async sendEmail(message: EmailMessage): Promise<EmailResult> {
    this.sentEmails.push({
      ...message,
      sentAt: new Date(),
    });

    console.log('📧 Mock Email Sent:', {
      to: message.to,
      subject: message.subject,
      sentAt: new Date().toISOString(),
    });

    return {
      success: true,
      messageId: `mock-${Date.now()}`,
    };
  }

  getSentEmails() {
    return this.sentEmails;
  }

  clearSentEmails() {
    this.sentEmails = [];
  }
}

// Use mock service in test environment
export function getEmailServiceForTesting(): MockEmailService {
  return new MockEmailService();
}
