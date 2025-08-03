// Receivables Messaging Integration
// Handles automatic messaging when receivables change

import { prisma } from '@/lib/prisma';
import { MessageService, TemplateVariables } from './message-service';
import { MessageTrigger, RecipientType } from '@prisma/client';

export interface ReceivablesChangeData {
  tenantId: string;
  driverId: string;
  oldCashReceivables: number;
  newCashReceivables: number;
  oldCylinderReceivables: number;
  newCylinderReceivables: number;
  changeReason: string;
  saleId?: string;
  paymentId?: string;
}

export class ReceivablesMessaging {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  /**
   * Handle receivables change and send appropriate messages
   */
  async handleReceivablesChange(data: ReceivablesChangeData): Promise<void> {
    try {
      // Get driver information
      const driver = await prisma.driver.findUnique({
        where: { id: data.driverId },
        select: {
          id: true,
          name: true,
          phone: true,
          tenantId: true,
        },
      });

      if (!driver || !driver.phone) {
        console.log('Driver not found or has no phone number:', data.driverId);
        return;
      }

      // Calculate changes
      const cashChange = data.newCashReceivables - data.oldCashReceivables;
      const cylinderChange =
        data.newCylinderReceivables - data.oldCylinderReceivables;
      const totalChange = cashChange + cylinderChange;

      // Skip if no significant change
      if (Math.abs(totalChange) < 1) {
        return;
      }

      // Determine message trigger type  
      let triggerType: MessageTrigger = MessageTrigger.RECEIVABLES_CHANGE;

      // Prepare template variables
      const templateVariables: TemplateVariables = {
        driverName: driver.name,
        amount: this.formatCurrency(Math.abs(totalChange)),
        oldAmount: this.formatCurrency(
          data.oldCashReceivables + data.oldCylinderReceivables
        ),
        newAmount: this.formatCurrency(
          data.newCashReceivables + data.newCylinderReceivables
        ),
        change: this.formatCurrency(Math.abs(totalChange)),
        changeType: totalChange > 0 ? 'increase' : 'decrease',
        date: new Date().toLocaleDateString('bn-BD'),
        time: new Date().toLocaleTimeString('bn-BD', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        cashChange: this.formatCurrency(Math.abs(cashChange)),
        cylinderChange: this.formatCurrency(Math.abs(cylinderChange)),
        changeReason: data.changeReason,
      };

      // Add company name if available
      const tenant = await prisma.tenant.findUnique({
        where: { id: data.tenantId },
        select: { name: true },
      });
      if (tenant) {
        templateVariables.companyName = tenant.name;
      }

      // Send message
      await this.messageService.sendReceivablesMessage({
        tenantId: data.tenantId,
        recipientType: RecipientType.DRIVER,
        recipientId: driver.id,
        recipientPhone: driver.phone,
        recipientName: driver.name,
        triggerType,
        triggerData: templateVariables,
        language: 'bn', // Default to Bengali
      });

      console.log(
        `Receivables message sent to ${driver.name} for ${this.formatCurrency(totalChange)} change`
      );
    } catch (error) {
      console.error('Error handling receivables change:', error);
    }
  }

  /**
   * Handle payment received
   */
  async handlePaymentReceived(data: {
    tenantId: string;
    driverId: string;
    amount: number;
    paymentType: 'cash' | 'cylinder';
    paymentId: string;
  }): Promise<void> {
    try {
      const driver = await prisma.driver.findUnique({
        where: { id: data.driverId },
        select: { id: true, name: true, phone: true },
      });

      if (!driver || !driver.phone) return;

      const templateVariables: TemplateVariables = {
        driverName: driver.name,
        amount: this.formatCurrency(data.amount),
        paymentType: data.paymentType === 'cash' ? 'নগদ' : 'সিলিন্ডার',
        date: new Date().toLocaleDateString('bn-BD'),
        time: new Date().toLocaleTimeString('bn-BD', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        oldAmount: '',
        newAmount: '',
        change: data.amount.toString(),
        changeType: 'decrease',
      };

      await this.messageService.sendReceivablesMessage({
        tenantId: data.tenantId,
        recipientType: RecipientType.DRIVER,
        recipientId: driver.id,
        recipientPhone: driver.phone,
        recipientName: driver.name,
        triggerType: MessageTrigger.PAYMENT_RECEIVED,
        triggerData: templateVariables,
        language: 'bn',
      });
    } catch (error) {
      console.error('Error handling payment message:', error);
    }
  }

  /**
   * Send daily receivables summary
   */
  async sendDailySummary(tenantId: string): Promise<void> {
    try {
      // Get all drivers with receivables
      const drivers = await prisma.driver.findMany({
        where: {
          tenantId,
          status: 'ACTIVE',
          phone: { not: null },
        },
        include: {
          receivableRecords: {
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

      for (const driver of drivers) {
        if (!driver.phone || driver.receivableRecords.length === 0) continue;

        const latestRecord = driver.receivableRecords[0];
        const totalReceivables =
          latestRecord.totalCashReceivables + latestRecord.totalCylinderReceivables;

        if (totalReceivables === 0) continue; // Skip drivers with no receivables

        const templateVariables: TemplateVariables = {
          driverName: driver.name,
          amount: this.formatCurrency(totalReceivables),
          cashAmount: this.formatCurrency(latestRecord.totalCashReceivables),
          cylinderAmount: this.formatCurrency(latestRecord.totalCylinderReceivables),
          date: new Date().toLocaleDateString('bn-BD'),
          time: new Date().toLocaleTimeString('bn-BD', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          oldAmount: '',
          newAmount: '',
          change: '',
          changeType: 'increase',
        };

        await this.messageService.sendReceivablesMessage({
          tenantId,
          recipientType: RecipientType.DRIVER,
          recipientId: driver.id,
          recipientPhone: driver.phone,
          recipientName: driver.name,
          triggerType: MessageTrigger.MANUAL,
          triggerData: templateVariables,
          language: 'bn',
        });
      }
    } catch (error) {
      console.error('Error sending daily summary:', error);
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

// Integration helper functions to be called from existing receivables code
export const receivablesMessaging = new ReceivablesMessaging();

/**
 * Call this function whenever receivables are updated
 */
export async function notifyReceivablesChange(
  data: ReceivablesChangeData
): Promise<void> {
  // Run in background to avoid blocking main operation
  setImmediate(async () => {
    try {
      await receivablesMessaging.handleReceivablesChange(data);
    } catch (error) {
      console.error('Error in receivables messaging:', error);
    }
  });
}

/**
 * Call this function when payment is received
 */
export async function notifyPaymentReceived(data: {
  tenantId: string;
  driverId: string;
  amount: number;
  paymentType: 'cash' | 'cylinder';
  paymentId: string;
}): Promise<void> {
  setImmediate(async () => {
    try {
      await receivablesMessaging.handlePaymentReceived(data);
    } catch (error) {
      console.error('Error in payment messaging:', error);
    }
  });
}
