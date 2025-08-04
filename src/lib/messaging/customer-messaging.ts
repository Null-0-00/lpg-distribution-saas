// Customer Messaging System
// Handles automatic messaging when customer receivables change

import { prisma } from '@/lib/prisma';
import { MessageService, TemplateVariables } from './message-service';
import { MessageTrigger, RecipientType } from '@prisma/client';

export interface CustomerReceivablesChangeData {
  tenantId: string;
  customerId: string;
  oldCashReceivables: number;
  newCashReceivables: number;
  oldCylinderReceivables: number;
  newCylinderReceivables: number;
  changeReason: string;
  saleId?: string;
  paymentId?: string;
  updatedBy?: string;
}

export class CustomerMessaging {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  /**
   * Handle customer receivables change and send appropriate messages
   */
  async handleCustomerReceivablesChange(
    data: CustomerReceivablesChangeData
  ): Promise<void> {
    try {
      // Get customer information with area and driver details
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
        include: {
          area: {
            select: {
              name: true,
              code: true,
            },
          },
          driver: {
            select: {
              name: true,
              phone: true,
            },
          },
          tenant: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!customer || !customer.phone) {
        console.log(
          'Customer not found or has no phone number:',
          data.customerId
        );
        return;
      }

      // Calculate changes
      const cashChange = data.newCashReceivables - data.oldCashReceivables;
      const cylinderChange =
        data.newCylinderReceivables - data.oldCylinderReceivables;
      const totalChange = cashChange + cylinderChange;

      // Skip if no significant change (less than 1 taka)
      if (Math.abs(totalChange) < 1) {
        return;
      }

      // Determine message trigger type
      const triggerType: MessageTrigger = MessageTrigger.RECEIVABLES_CHANGE;

      // Prepare template variables for customer messaging
      const templateVariables: TemplateVariables = {
        // Customer specific variables
        customerName: customer.name,
        customerCode: customer.customerCode || 'N/A',
        areaName: customer.area.name,
        driverName: customer.driver?.name || 'No Driver',
        companyName: customer.tenant.name,

        // Financial details
        amount: this.formatCurrency(Math.abs(totalChange)),
        oldAmount: this.formatCurrency(
          data.oldCashReceivables + data.oldCylinderReceivables
        ),
        newAmount: this.formatCurrency(
          data.newCashReceivables + data.newCylinderReceivables
        ),
        change: this.formatCurrency(Math.abs(totalChange)),
        changeType: totalChange > 0 ? 'increase' : 'decrease',

        // Cash and cylinder breakdown
        cashAmount: this.formatCurrency(data.newCashReceivables),
        cylinderAmount: this.formatCurrency(data.newCylinderReceivables),
        cashChange: this.formatCurrency(Math.abs(cashChange)),
        cylinderChange: this.formatCurrency(Math.abs(cylinderChange)),

        // Date and time
        date: new Date().toLocaleDateString('bn-BD'),
        time: new Date().toLocaleTimeString('bn-BD', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),

        // Additional context
        changeReason: data.changeReason,
        updatedBy: data.updatedBy || 'System',

        // Legacy variables for compatibility already included above
      };

      // Send message to customer
      await this.messageService.sendReceivablesMessage({
        tenantId: data.tenantId,
        recipientType: RecipientType.CUSTOMER,
        recipientId: customer.id,
        recipientPhone: customer.phone,
        recipientName: customer.name,
        triggerType,
        triggerData: templateVariables,
        language: 'bn', // Default to Bengali
      });

      console.log(
        `Customer receivables message sent to ${customer.name} (${customer.customerCode}) for ${this.formatCurrency(totalChange)} change`
      );
    } catch (error) {
      console.error('Error handling customer receivables change:', error);
    }
  }

  /**
   * Handle customer payment received
   */
  async handleCustomerPaymentReceived(data: {
    tenantId: string;
    customerId: string;
    amount: number;
    paymentType: 'cash' | 'cylinder';
    paymentId: string;
    receivedBy?: string;
  }): Promise<void> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
        include: {
          area: { select: { name: true } },
          driver: { select: { name: true } },
          tenant: { select: { name: true } },
        },
      });

      if (!customer || !customer.phone) return;

      const templateVariables: TemplateVariables = {
        customerName: customer.name,
        customerCode: customer.customerCode || 'N/A',
        areaName: customer.area.name,
        driverName: customer.driver?.name || 'No Driver',
        companyName: customer.tenant.name,
        amount: this.formatCurrency(data.amount),
        paymentType: data.paymentType === 'cash' ? 'নগদ' : 'সিলিন্ডার',
        receivedBy: data.receivedBy || customer.driver?.name || 'Admin',
        date: new Date().toLocaleDateString('bn-BD'),
        time: new Date().toLocaleTimeString('bn-BD', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        // Legacy compatibility - driverName already included above
        oldAmount: '',
        newAmount: '',
        change: data.amount.toString(),
        changeType: 'decrease',
      };

      await this.messageService.sendReceivablesMessage({
        tenantId: data.tenantId,
        recipientType: RecipientType.CUSTOMER,
        recipientId: customer.id,
        recipientPhone: customer.phone,
        recipientName: customer.name,
        triggerType: MessageTrigger.PAYMENT_RECEIVED,
        triggerData: templateVariables,
        language: 'bn',
      });
    } catch (error) {
      console.error('Error handling customer payment message:', error);
    }
  }

  /**
   * Send daily receivables summary to customers with outstanding balances
   */
  async sendCustomerDailySummary(
    tenantId: string,
    areaId?: string
  ): Promise<void> {
    try {
      // Get customers with outstanding receivables
      const customers = await prisma.customer.findMany({
        where: {
          tenantId,
          isActive: true,
          phone: { not: null },
          ...(areaId && { areaId }),
        },
        include: {
          area: { select: { name: true } },
          driver: { select: { name: true } },
          tenant: { select: { name: true } },
          customerReceivableRecords: {
            where: {
              date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999)),
              },
            },
            orderBy: { date: 'desc' },
            take: 1,
          },
        },
      });

      for (const customer of customers) {
        if (!customer.phone || customer.customerReceivableRecords.length === 0)
          continue;

        const latestRecord = customer.customerReceivableRecords[0];
        const totalReceivables =
          latestRecord.cashReceivables + latestRecord.cylinderReceivables;

        // Only send summary if customer has outstanding balance
        if (totalReceivables <= 0) continue;

        const templateVariables: TemplateVariables = {
          customerName: customer.name,
          customerCode: customer.customerCode || 'N/A',
          areaName: customer.area.name,
          driverName: customer.driver?.name || 'No Driver',
          companyName: customer.tenant.name,
          amount: this.formatCurrency(totalReceivables),
          cashAmount: this.formatCurrency(latestRecord.cashReceivables),
          cylinderAmount: this.formatCurrency(latestRecord.cylinderReceivables),
          date: new Date().toLocaleDateString('bn-BD'),
          time: new Date().toLocaleTimeString('bn-BD', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          // Legacy compatibility - driverName already included above
          oldAmount: '',
          newAmount: '',
          change: '',
          changeType: 'increase',
        };

        await this.messageService.sendReceivablesMessage({
          tenantId,
          recipientType: RecipientType.CUSTOMER,
          recipientId: customer.id,
          recipientPhone: customer.phone,
          recipientName: customer.name,
          triggerType: MessageTrigger.MANUAL,
          triggerData: templateVariables,
          language: 'bn',
        });
      }

      console.log(
        `Daily summary sent to customers in tenant ${tenantId}${areaId ? ` area ${areaId}` : ''}`
      );
    } catch (error) {
      console.error('Error sending customer daily summary:', error);
    }
  }

  /**
   * Send overdue notifications to customers
   */
  async sendOverdueNotifications(
    tenantId: string,
    daysOverdue: number = 7
  ): Promise<void> {
    try {
      // Get customers with overdue receivables
      const overdueDate = new Date();
      overdueDate.setDate(overdueDate.getDate() - daysOverdue);

      const overdueCustomers = (await prisma.$queryRaw`
        SELECT 
          c.id,
          c.name,
          c."customerCode",
          c.phone,
          a.name as "areaName",
          d.name as "driverName",
          d.phone as "driverPhone",
          t.name as "companyName",
          SUM(crr."cashReceivables") as "totalCash",
          SUM(crr."cylinderReceivables") as "totalCylinder",
          SUM(crr."totalReceivables") as "totalOutstanding",
          MIN(crr.date) as "oldestDate"
        FROM customers c
        JOIN areas a ON c."areaId" = a.id
        LEFT JOIN drivers d ON c."driverId" = d.id
        JOIN tenants t ON c."tenantId" = t.id
        JOIN customer_receivable_records crr ON c.id = crr."customerId"
        WHERE c."tenantId" = ${tenantId}
        AND c."isActive" = true
        AND c.phone IS NOT NULL
        AND crr.date <= ${overdueDate}
        AND (crr."cashReceivables" > 0 OR crr."cylinderReceivables" > 0)
        GROUP BY c.id, c.name, c."customerCode", c.phone, a.name, d.name, d.phone, t.name
        HAVING SUM(crr."totalReceivables") > 0
        ORDER BY MIN(crr.date) ASC
      `) as any[];

      for (const customer of overdueCustomers) {
        const daysDiff = Math.floor(
          (new Date().getTime() - new Date(customer.oldestDate).getTime()) /
            (1000 * 3600 * 24)
        );

        const templateVariables: TemplateVariables = {
          customerName: customer.name,
          customerCode: customer.customerCode || 'N/A',
          areaName: customer.areaName,
          driverName: customer.driverName,
          companyName: customer.companyName,
          amount: this.formatCurrency(Number(customer.totalOutstanding)),
          cashAmount: this.formatCurrency(Number(customer.totalCash)),
          cylinderAmount: this.formatCurrency(Number(customer.totalCylinder)),
          daysOverdue: daysDiff.toString(),
          oldestDate: new Date(customer.oldestDate).toLocaleDateString('bn-BD'),
          contactNumber: customer.driverPhone || 'অফিসে যোগাযোগ করুন',
          date: new Date().toLocaleDateString('bn-BD'),
          time: new Date().toLocaleTimeString('bn-BD', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          // Legacy compatibility - driverName already included above
          oldAmount: '',
          newAmount: '',
          change: '',
          changeType: 'increase',
        };

        await this.messageService.sendReceivablesMessage({
          tenantId,
          recipientType: RecipientType.CUSTOMER,
          recipientId: customer.id,
          recipientPhone: customer.phone,
          recipientName: customer.name,
          triggerType: MessageTrigger.OVERDUE_REMINDER,
          triggerData: templateVariables,
          language: 'bn',
        });
      }

      console.log(
        `Overdue notifications sent to ${overdueCustomers.length} customers`
      );
    } catch (error) {
      console.error('Error sending overdue notifications:', error);
    }
  }

  /**
   * Format currency in Bengali locale
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}

// Export instance and helper functions
export const customerMessaging = new CustomerMessaging();

/**
 * Call this function whenever customer receivables are updated
 */
export async function notifyCustomerReceivablesChange(
  data: CustomerReceivablesChangeData
): Promise<void> {
  // Run in background to avoid blocking main operation
  setImmediate(async () => {
    try {
      await customerMessaging.handleCustomerReceivablesChange(data);
    } catch (error) {
      console.error('Error in customer receivables messaging:', error);
    }
  });
}

/**
 * Call this function when customer payment is received
 */
export async function notifyCustomerPaymentReceived(data: {
  tenantId: string;
  customerId: string;
  amount: number;
  paymentType: 'cash' | 'cylinder';
  paymentId: string;
  receivedBy?: string;
}): Promise<void> {
  setImmediate(async () => {
    try {
      await customerMessaging.handleCustomerPaymentReceived(data);
    } catch (error) {
      console.error('Error in customer payment messaging:', error);
    }
  });
}
