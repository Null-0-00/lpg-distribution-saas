/**
 * Email Service Configuration
 *
 * Supports multiple email providers:
 * - Resend (recommended)
 * - SendGrid
 * - SMTP (custom)
 */

export interface EmailConfig {
  provider: 'resend' | 'sendgrid' | 'smtp';
  from: string;
  fromName: string;
  replyTo?: string;
}

export interface ResendConfig extends EmailConfig {
  provider: 'resend';
  apiKey: string;
}

export interface SendGridConfig extends EmailConfig {
  provider: 'sendgrid';
  apiKey: string;
}

export interface SMTPConfig extends EmailConfig {
  provider: 'smtp';
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
}

export type EmailProviderConfig = ResendConfig | SendGridConfig | SMTPConfig;

// Environment-based configuration
export function getEmailConfig(): EmailProviderConfig {
  const provider =
    (process.env.EMAIL_PROVIDER as 'resend' | 'sendgrid' | 'smtp') || 'smtp';
  const from = process.env.EMAIL_FROM || 'noreply@lpg-distributor.com';
  const fromName = process.env.EMAIL_FROM_NAME || 'LPG Distributor SaaS';
  const replyTo = process.env.EMAIL_REPLY_TO;

  const baseConfig = {
    from,
    fromName,
    replyTo,
  };

  switch (provider) {
    case 'resend':
      return {
        ...baseConfig,
        provider: 'resend',
        apiKey: process.env.RESEND_API_KEY || '',
      };

    case 'sendgrid':
      return {
        ...baseConfig,
        provider: 'sendgrid',
        apiKey: process.env.SENDGRID_API_KEY || '',
      };

    case 'smtp':
    default:
      return {
        ...baseConfig,
        provider: 'smtp',
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        username: process.env.SMTP_USERNAME || '',
        password: process.env.SMTP_PASSWORD || '',
      };
  }
}

// Validation
export function validateEmailConfig(config: EmailProviderConfig): string[] {
  const errors: string[] = [];

  if (!config.from) {
    errors.push('EMAIL_FROM is required');
  }

  if (!config.fromName) {
    errors.push('EMAIL_FROM_NAME is required');
  }

  switch (config.provider) {
    case 'resend':
      if (!config.apiKey) {
        errors.push('RESEND_API_KEY is required for Resend provider');
      }
      break;

    case 'sendgrid':
      if (!config.apiKey) {
        errors.push('SENDGRID_API_KEY is required for SendGrid provider');
      }
      break;

    case 'smtp':
      if (!config.host) {
        errors.push('SMTP_HOST is required for SMTP provider');
      }
      if (!config.username) {
        errors.push('SMTP_USERNAME is required for SMTP provider');
      }
      if (!config.password) {
        errors.push('SMTP_PASSWORD is required for SMTP provider');
      }
      break;
  }

  return errors;
}

// Development/testing configuration
export function getTestEmailConfig(): EmailProviderConfig {
  return {
    provider: 'smtp',
    from: 'test@localhost',
    fromName: 'Test Environment',
    host: 'localhost',
    port: 1025, // MailHog default port
    secure: false,
    username: '',
    password: '',
  };
}
