// Default Message Templates in Bengali and English
// These templates will be created during tenant setup

export const DEFAULT_MESSAGE_TEMPLATES = {
  // Bengali Templates
  bn: {
    RECEIVABLES_INCREASE: {
      whatsapp: `🔴 বাকি বৃদ্ধি - {{companyName}}

প্রিয় {{driverName}},

আপনার বাকির পরিমাণ {{change}} টাকা বৃদ্ধি পেয়েছে।

পূর্বের বাকি: {{oldAmount}}
বর্তমান বাকি: {{newAmount}}
বৃদ্ধি: {{change}}

কারণ: {{changeReason}}

সময়: {{date}} {{time}}

দ্রুত পরিশোধ করুন। ধন্যবাদ।`,

      sms: `বাকি বৃদ্ধি: {{change}} টাকা
{{driverName}}, আপনার মোট বাকি এখন {{newAmount}}
কারণ: {{changeReason}}
দ্রুত পরিশোধ করুন।`,
    },

    RECEIVABLES_DECREASE: {
      whatsapp: `🟢 বাকি হ্রাস - {{companyName}}

প্রিয় {{driverName}},

আপনার বাকির পরিমাণ {{change}} টাকা কমেছে।

পূর্বের বাকি: {{oldAmount}}
বর্তমান বাকি: {{newAmount}}
হ্রাস: {{change}}

কারণ: {{changeReason}}

সময়: {{date}} {{time}}

ধন্যবাদ।`,

      sms: `বাকি হ্রাস: {{change}} টাকা
{{driverName}}, আপনার মোট বাকি এখন {{newAmount}}
কারণ: {{changeReason}}
ধন্যবাদ।`,
    },

    RECEIVABLES_PAYMENT: {
      whatsapp: `💰 পেমেন্ট গৃহীত - {{companyName}}

প্রিয় {{driverName}},

আপনার {{paymentType}} পেমেন্ট গৃহীত হয়েছে।

পেমেন্ট: {{amount}}
সময়: {{date}} {{time}}

ধন্যবাদ।`,

      sms: `পেমেন্ট গৃহীত: {{amount}}
{{driverName}}, {{paymentType}} পেমেন্ট গৃহীত।
ধন্যবাদ।`,
    },

    DAILY_SUMMARY: {
      whatsapp: `📊 দৈনিক বাকির হিসাব - {{companyName}}

প্রিয় {{driverName}},

{{date}} তারিখের বাকির হিসাব:

💰 নগদ বাকি: {{cashAmount}}
🔄 সিলিন্ডার বাকি: {{cylinderAmount}}
📈 মোট বাকি: {{amount}}

দ্রুত পরিশোধের জন্য অনুরোধ করা হলো।

ধন্যবাদ।`,

      sms: `দৈনিক বাকি {{date}}
{{driverName}}: মোট {{amount}}
নগদ: {{cashAmount}}, সিলিন্ডার: {{cylinderAmount}}
দ্রুত পরিশোধ করুন।`,
    },

    RECEIVABLES_OVERDUE: {
      whatsapp: `⚠️ বাকি পরিশোধের জরুরি অনুরোধ - {{companyName}}

প্রিয় {{driverName}},

আপনার বাকির পরিমাণ অনেক দিন ধরে বকেয়া রয়েছে।

মোট বাকি: {{amount}}
বকেয়া দিন: {{daysOverdue}}

অনুগ্রহ করে অবিলম্বে পরিশোধ করুন।

যোগাযোগ: {{contactNumber}}

ধন্যবাদ।`,

      sms: `জরুরি: {{driverName}}
বকেয়া {{amount}} ({{daysOverdue}} দিন)
অবিলম্বে পরিশোধ করুন।
যোগাযোগ: {{contactNumber}}`,
    },
  },

  // English Templates
  en: {
    RECEIVABLES_INCREASE: {
      whatsapp: `🔴 Receivables Increased - {{companyName}}

Dear {{driverName}},

Your receivables have increased by {{change}}.

Previous: {{oldAmount}}
Current: {{newAmount}}
Increase: {{change}}

Reason: {{changeReason}}

Time: {{date}} {{time}}

Please pay soon. Thank you.`,

      sms: `Receivables +{{change}}
{{driverName}}, Total: {{newAmount}}
Reason: {{changeReason}}
Please pay soon.`,
    },

    RECEIVABLES_DECREASE: {
      whatsapp: `🟢 Receivables Decreased - {{companyName}}

Dear {{driverName}},

Your receivables have decreased by {{change}}.

Previous: {{oldAmount}}
Current: {{newAmount}}
Decrease: {{change}}

Reason: {{changeReason}}

Time: {{date}} {{time}}

Thank you.`,

      sms: `Receivables -{{change}}
{{driverName}}, Total: {{newAmount}}
Reason: {{changeReason}}
Thank you.`,
    },

    RECEIVABLES_PAYMENT: {
      whatsapp: `💰 Payment Received - {{companyName}}

Dear {{driverName}},

Your {{paymentType}} payment has been received.

Payment: {{amount}}
Time: {{date}} {{time}}

Thank you.`,

      sms: `Payment Received: {{amount}}
{{driverName}}, {{paymentType}} payment received.
Thank you.`,
    },

    DAILY_SUMMARY: {
      whatsapp: `📊 Daily Receivables Summary - {{companyName}}

Dear {{driverName}},

Receivables as of {{date}}:

💰 Cash: {{cashAmount}}
🔄 Cylinders: {{cylinderAmount}}
📈 Total: {{amount}}

Please arrange payment soon.

Thank you.`,

      sms: `Daily Summary {{date}}
{{driverName}}: Total {{amount}}
Cash: {{cashAmount}}, Cylinders: {{cylinderAmount}}
Please pay soon.`,
    },

    RECEIVABLES_OVERDUE: {
      whatsapp: `⚠️ Urgent Payment Request - {{companyName}}

Dear {{driverName}},

Your receivables are overdue.

Total: {{amount}}
Days Overdue: {{daysOverdue}}

Please pay immediately.

Contact: {{contactNumber}}

Thank you.`,

      sms: `URGENT: {{driverName}}
Overdue {{amount}} ({{daysOverdue}} days)
Pay immediately.
Contact: {{contactNumber}}`,
    },
  },
};

/**
 * Create default templates for a tenant
 */
export async function createDefaultMessageTemplates(
  tenantId: string,
  providerId: string,
  language: 'bn' | 'en' = 'bn'
) {
  const templates = DEFAULT_MESSAGE_TEMPLATES[language];
  const createdTemplates = [];

  for (const [triggerType, messageTypes] of Object.entries(templates)) {
    for (const [messageType, template] of Object.entries(messageTypes)) {
      const templateName = `${triggerType}_${messageType.toUpperCase()}_${language.toUpperCase()}`;

      try {
        const created = await prisma?.messageTemplate.create({
          data: {
            tenantId,
            providerId,
            name: templateName,
            trigger: triggerType as any,
            messageType: messageType.toUpperCase() as any,
            template: template,
            variables: {},
            isActive: true,
          },
        });

        createdTemplates.push(created);
      } catch (error) {
        console.error(`Error creating template ${templateName}:`, error);
      }
    }
  }

  return createdTemplates;
}
