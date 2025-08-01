/**
 * Email Templates
 *
 * Centralized email template management with HTML and text versions
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface BaseTemplateData {
  name: string;
  appName: string;
  appUrl: string;
}

interface VerificationEmailData extends BaseTemplateData {
  verificationCode: string;
  expiresInMinutes: number;
}

interface PasswordResetEmailData extends BaseTemplateData {
  resetCode: string;
  expiresInMinutes: number;
}

interface WelcomeEmailData extends BaseTemplateData {
  tenantName: string;
  dashboardUrl: string;
}

interface TenantApprovalEmailData extends BaseTemplateData {
  tenantName: string;
  approved: boolean;
  reason?: string;
  dashboardUrl?: string;
}

// Base template wrapper
function createBaseTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .code {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
            letter-spacing: 2px;
            border: 2px dashed #2563eb;
        }
        .button {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
            text-align: center;
        }
        .warning {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
        }
        .success {
            background: #d1fae5;
            border: 1px solid #10b981;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #065f46;
        }
        .error {
            background: #fee2e2;
            border: 1px solid #ef4444;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #991b1b;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏢 LPG Distributor SaaS</div>
        </div>
        ${content}
        <div class="footer">
            <p>This email was sent from LPG Distributor SaaS</p>
            <p>If you didn't request this action, please contact support immediately.</p>
        </div>
    </div>
</body>
</html>`;
}

export function createVerificationEmail(
  data: VerificationEmailData
): EmailTemplate {
  const html = createBaseTemplate(
    `
    <h2>Verify Your Email Address</h2>
    <p>Hello ${data.name},</p>
    <p>Welcome to ${data.appName}! To complete your registration, please verify your email address using the code below:</p>
    
    <div class="code">${data.verificationCode}</div>
    
    <p>Enter this code on the verification page to activate your account.</p>
    
    <div class="warning">
        <strong>Important:</strong> This verification code will expire in ${data.expiresInMinutes} minutes for security reasons.
    </div>
    
    <p>If you didn't create this account, please ignore this email.</p>
    
    <p>Best regards,<br>The ${data.appName} Team</p>
  `,
    'Verify Your Email Address'
  );

  const text = `
Verify Your Email Address

Hello ${data.name},

Welcome to ${data.appName}! To complete your registration, please verify your email address using the code below:

Verification Code: ${data.verificationCode}

Enter this code on the verification page to activate your account.

Important: This verification code will expire in ${data.expiresInMinutes} minutes for security reasons.

If you didn't create this account, please ignore this email.

Best regards,
The ${data.appName} Team
  `.trim();

  return {
    subject: `Verify your email address for ${data.appName}`,
    html,
    text,
  };
}

export function createPasswordResetEmail(
  data: PasswordResetEmailData
): EmailTemplate {
  const html = createBaseTemplate(
    `
    <h2>Reset Your Password</h2>
    <p>Hello ${data.name},</p>
    <p>We received a request to reset your password for your ${data.appName} account.</p>
    
    <div class="code">${data.resetCode}</div>
    
    <p>Enter this code on the password reset page to create a new password.</p>
    
    <div class="warning">
        <strong>Security Notice:</strong> This reset code will expire in ${data.expiresInMinutes} minutes.
    </div>
    
    <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
    
    <p>Best regards,<br>The ${data.appName} Team</p>
  `,
    'Reset Your Password'
  );

  const text = `
Reset Your Password

Hello ${data.name},

We received a request to reset your password for your ${data.appName} account.

Reset Code: ${data.resetCode}

Enter this code on the password reset page to create a new password.

Security Notice: This reset code will expire in ${data.expiresInMinutes} minutes.

If you didn't request a password reset, please ignore this email and your password will remain unchanged.

Best regards,
The ${data.appName} Team
  `.trim();

  return {
    subject: `Reset your ${data.appName} password`,
    html,
    text,
  };
}

export function createWelcomeEmail(data: WelcomeEmailData): EmailTemplate {
  const html = createBaseTemplate(
    `
    <h2>Welcome to ${data.appName}! 🎉</h2>
    <p>Hello ${data.name},</p>
    <p>Your email has been verified successfully! Welcome to ${data.appName}.</p>
    
    <div class="success">
        <strong>Your account is now active!</strong> You can start using all the features of ${data.tenantName}.
    </div>
    
    <p>Here's what you can do next:</p>
    <ul>
        <li>Complete your business profile setup</li>
        <li>Configure your inventory and products</li>
        <li>Set up your team members</li>
        <li>Start tracking your LPG distribution business</li>
    </ul>
    
    <p style="text-align: center;">
        <a href="${data.dashboardUrl}" class="button">Go to Dashboard</a>
    </p>
    
    <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
    
    <p>Best regards,<br>The ${data.appName} Team</p>
  `,
    'Welcome to LPG Distributor SaaS'
  );

  const text = `
Welcome to ${data.appName}!

Hello ${data.name},

Your email has been verified successfully! Welcome to ${data.appName}.

Your account is now active! You can start using all the features of ${data.tenantName}.

Here's what you can do next:
- Complete your business profile setup
- Configure your inventory and products
- Set up your team members
- Start tracking your LPG distribution business

Go to Dashboard: ${data.dashboardUrl}

If you have any questions or need assistance, don't hesitate to reach out to our support team.

Best regards,
The ${data.appName} Team
  `.trim();

  return {
    subject: `Welcome to ${data.appName}! Your account is ready`,
    html,
    text,
  };
}

export function createTenantApprovalEmail(
  data: TenantApprovalEmailData
): EmailTemplate {
  const html = createBaseTemplate(
    `
    <h2>${data.approved ? 'Account Approved! 🎉' : 'Account Update'}</h2>
    <p>Hello ${data.name},</p>
    
    ${
      data.approved
        ? `
    <div class="success">
        <strong>Great news!</strong> Your ${data.appName} account for ${data.tenantName} has been approved.
    </div>
    
    <p>You can now access your dashboard and start using all the features:</p>
    <ul>
        <li>Manage your LPG inventory</li>
        <li>Track sales and deliveries</li>
        <li>Generate reports and analytics</li>
        <li>Manage your team and drivers</li>
    </ul>
    
    <p style="text-align: center;">
        <a href="${data.dashboardUrl}" class="button">Access Your Dashboard</a>
    </p>
    `
        : `
    <div class="error">
        We regret to inform you that your ${data.appName} account application has not been approved at this time.
    </div>
    
    ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
    
    <p>If you believe this was a mistake or would like to reapply, please contact our support team.</p>
    `
    }
    
    <p>Thank you for your interest in ${data.appName}.</p>
    
    <p>Best regards,<br>The ${data.appName} Team</p>
  `,
    data.approved ? 'Account Approved' : 'Account Update'
  );

  const text = `
${data.approved ? 'Account Approved!' : 'Account Update'}

Hello ${data.name},

${
  data.approved
    ? `
Great news! Your ${data.appName} account for ${data.tenantName} has been approved.

You can now access your dashboard and start using all the features:
- Manage your LPG inventory
- Track sales and deliveries
- Generate reports and analytics
- Manage your team and drivers

Access Your Dashboard: ${data.dashboardUrl}
`
    : `
We regret to inform you that your ${data.appName} account application has not been approved at this time.

${data.reason ? `Reason: ${data.reason}` : ''}

If you believe this was a mistake or would like to reapply, please contact our support team.
`
}

Thank you for your interest in ${data.appName}.

Best regards,
The ${data.appName} Team
  `.trim();

  return {
    subject: `${data.appName} Account ${data.approved ? 'Approved' : 'Update'}`,
    html,
    text,
  };
}

// Template helper functions
export function getAppData() {
  return {
    appName: process.env.APP_NAME || 'LPG Distributor SaaS',
    appUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  };
}
