# 📱 Automated Messaging System Implementation Guide

## Overview

Complete implementation of automated WhatsApp/SMS messaging for LPG receivables updates.

## 🏗️ Architecture Components

### 1. Database Schema

- `MessageProvider` - WhatsApp/SMS provider configurations
- `MessageTemplate` - Customizable message templates
- `SentMessage` - Message history and status tracking
- `MessagingSettings` - Tenant-specific messaging preferences

### 2. Provider Integrations

- **WhatsApp**: Twilio, Meta Business API, Gupshup
- **SMS**: Twilio, Nexmo, SSL Wireless, Robi, Grameenphone
- **Extensible**: Easy to add new providers

### 3. Message Triggers

- Receivables increase/decrease
- Payment received
- Daily summaries
- Overdue notifications

## 🚀 Implementation Steps

### Step 1: Add Database Schema

```bash
# Add the messaging schema to your main prisma/schema.prisma
cat prisma/messaging-schema.prisma >> prisma/schema.prisma

# Generate and apply migration
npx prisma migrate dev --name "add-messaging-system"
```

### Step 2: Install Dependencies

```bash
npm install @types/node-fetch
```

### Step 3: Environment Variables

```env
# .env.local
WHATSAPP_PROVIDER=gupshup
WHATSAPP_API_KEY=your_gupshup_api_key
WHATSAPP_FROM_NUMBER=8801xxxxxxxxx

SMS_PROVIDER=ssl
SMS_API_KEY=your_ssl_api_key
SMS_FROM_NUMBER=your_sender_id
```

### Step 4: Integrate with Sales API

Replace your sales route or add this code after receivables calculation:

```typescript
// In your sales route (src/app/api/sales/route.ts)
import { notifyReceivablesChange } from '@/lib/messaging/receivables-messaging';

// After receivables calculation
await notifyReceivablesChange({
  tenantId,
  driverId: validatedData.driverId,
  oldCashReceivables: previousReceivables.cashReceivables,
  newCashReceivables: receivableRecord.cashReceivables,
  oldCylinderReceivables: previousReceivables.cylinderReceivables,
  newCylinderReceivables: receivableRecord.cylinderReceivables,
  changeReason: \`Sale: \${validatedData.quantity} \${validatedData.saleType}\`,
  saleId: newSale.id,
});
```

### Step 5: Setup for New Tenant

```typescript
import { setupBangladeshMessaging } from '@/lib/messaging/setup';

// During tenant onboarding
await setupBangladeshMessaging(
  tenantId,
  {
    provider: 'gupshup',
    apiKey: 'your_api_key',
    fromNumber: '8801xxxxxxxxx',
  },
  {
    provider: 'ssl',
    apiKey: 'your_sms_api_key',
    fromNumber: 'YourCompany',
  }
);
```

## 📋 Default Message Templates

### Bengali WhatsApp Template (Receivables Increase)

```
🔴 বাকি বৃদ্ধি - {{companyName}}

প্রিয় {{driverName}},

আপনার বাকির পরিমাণ {{change}} টাকা বৃদ্ধি পেয়েছে।

পূর্বের বাকি: {{oldAmount}}
বর্তমান বাকি: {{newAmount}}
বৃদ্ধি: {{change}}

কারণ: {{changeReason}}
সময়: {{date}} {{time}}

দ্রুত পরিশোধ করুন। ধন্যবাদ।
```

### SMS Template (Shorter)

```
বাকি বৃদ্ধি: {{change}} টাকা
{{driverName}}, মোট বাকি {{newAmount}}
কারণ: {{changeReason}}
দ্রুত পরিশোধ করুন।
```

## 🔧 API Endpoints

### Messaging Settings

- `GET /api/messaging/settings` - Get messaging configuration
- `PUT /api/messaging/settings` - Update messaging settings

### Message Templates

- `GET /api/messaging/templates` - List templates
- `POST /api/messaging/templates` - Create template
- `PUT /api/messaging/templates/[id]` - Update template

### Message History

- `GET /api/messaging/history` - View sent messages
- `GET /api/messaging/stats` - Messaging statistics

## 🎯 Provider Setup Guide

### Gupshup (Recommended for Bangladesh)

1. Sign up at https://www.gupshup.io/
2. Get WhatsApp Business API access
3. Configure webhook URL: `https://yourapp.com/api/messaging/webhooks/gupshup`

### SSL Wireless (Bangladesh SMS)

1. Contact SSL Wireless for API access
2. Get API credentials and sender ID
3. Test with their sandbox environment

### Twilio (International)

1. Sign up at https://www.twilio.com/
2. Get Account SID, Auth Token
3. Purchase WhatsApp/SMS enabled phone number

## ⚙️ Configuration Options

### Messaging Settings

```typescript
{
  isEnabled: true,
  allowWhatsApp: true,
  allowSMS: true,
  dailyMessageLimit: 1000,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
  timezone: "Asia/Dhaka"
}
```

### Template Variables

Available in all templates:

- `{{driverName}}` - Driver's name
- `{{amount}}` - Formatted currency amount
- `{{oldAmount}}` - Previous receivables amount
- `{{newAmount}}` - Current receivables amount
- `{{change}}` - Amount of change
- `{{changeType}}` - 'increase' or 'decrease'
- `{{date}}` - Current date in Bengali
- `{{time}}` - Current time in Bengali
- `{{companyName}}` - Tenant company name
- `{{changeReason}}` - Reason for the change

## 🔄 Background Jobs

### Daily Summary (Cron Job)

```typescript
// Add to your cron jobs or Next.js API routes
import { receivablesMessaging } from '@/lib/messaging/receivables-messaging';

// Send daily summary at 6 PM
export async function sendDailySummaries() {
  const tenants = await prisma.tenant.findMany({
    where: { isActive: true },
  });

  for (const tenant of tenants) {
    await receivablesMessaging.sendDailySummary(tenant.id);
  }
}
```

### Message Queue Processing

```typescript
// Process failed/queued messages
import { MessageService } from '@/lib/messaging/message-service';

const messageService = new MessageService();
await messageService.processMessageQueue();
```

## 📊 Monitoring & Analytics

### Message Statistics

- Total messages sent
- Delivery rates by provider
- Failed message reasons
- Peak messaging hours
- Cost tracking per provider

### Driver Engagement

- Message read rates
- Response patterns
- Opt-out requests
- Payment correlation with messages

## 🔐 Security & Privacy

### Data Protection

- Phone numbers encrypted in database
- Message content logged securely
- GDPR/privacy compliance
- Opt-out mechanism

### Rate Limiting

- Daily message limits per tenant
- Provider-specific throttling
- Quiet hours enforcement
- Emergency override capability

## 🧪 Testing

### Test Setup

```typescript
import { testMessagingSetup } from '@/lib/messaging/setup';

// Test all configured providers
const result = await testMessagingSetup(tenantId, '+8801XXXXXXXXX');
console.log('Test Results:', result);
```

### Manual Testing

1. Create test driver with your phone number
2. Make a test sale to trigger receivables change
3. Verify message delivery
4. Check message history in database

## 📈 Performance Optimization

### Message Queuing

- Background processing for non-urgent messages
- Batch processing during off-peak hours
- Retry logic with exponential backoff
- Dead letter queue for failed messages

### Database Optimization

- Indexes on frequently queried fields
- Message history archival
- Provider-specific optimizations
- Connection pooling for high volume

## 🚨 Error Handling

### Common Issues

1. **Invalid phone numbers** - Validate format before sending
2. **Provider downtime** - Fallback to alternative provider
3. **Rate limiting** - Queue messages for later
4. **Template errors** - Validation before saving

### Monitoring

- Provider API health checks
- Message delivery monitoring
- Error rate alerts
- Cost usage tracking

## 🔄 Migration Guide

If you have existing messaging systems:

1. **Export existing templates** to new format
2. **Migrate message history** if needed
3. **Update API integrations** to use new endpoints
4. **Test thoroughly** in staging environment
5. **Gradual rollout** by tenant or feature

## 📞 Support

### Provider Support

- **Gupshup**: https://www.gupshup.io/support
- **SSL Wireless**: Contact your account manager
- **Twilio**: https://support.twilio.com/

### Implementation Support

Review the code files and test in your development environment. All components are production-ready and include comprehensive error handling.

---

This messaging system will automatically notify drivers whenever their receivables change, helping improve payment collection and customer communication in your LPG distribution business. 🚛💨
