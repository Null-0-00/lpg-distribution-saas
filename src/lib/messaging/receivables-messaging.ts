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

export interface CustomerReceivablesChangeData {
  tenantId: string;
  customerId: string;
  oldCashReceivables: number;
  newCashReceivables: number;
  oldCylinderReceivables: number;
  newCylinderReceivables: number;
  changeReason: string;
  saleId?: string;
}

export class ReceivablesMessaging {
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
      console.log('🔔 Customer receivables messaging triggered:', data);
      // Get customer information
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
        select: {
          id: true,
          name: true,
          phone: true,
          tenantId: true,
          area: { select: { name: true } },
          driver: { select: { name: true } },
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

      // Skip if no significant change
      if (Math.abs(cashChange) < 0.01 && Math.abs(cylinderChange) < 1) {
        return;
      }

      // Determine message trigger type
      const triggerType: MessageTrigger = MessageTrigger.RECEIVABLES_CHANGE;

      // Build change details for cash and cylinder separately
      let cashChangeDetails = '';
      let cylinderChangeDetails = '';

      if (Math.abs(cashChange) >= 0.01) {
        const cashChangeType = cashChange > 0 ? 'বৃদ্ধি' : 'কমেছে';
        cashChangeDetails = `💰 নগদ বকেয়া পরিবর্তন:
পুরাতন: ${this.formatCurrency(data.oldCashReceivables)} টাকা
নতুন: ${this.formatCurrency(data.newCashReceivables)} টাকা
পরিবর্তন: ${this.formatCurrency(Math.abs(cashChange))} টাকা (${cashChangeType})`;
      }

      if (Math.abs(cylinderChange) >= 1) {
        const cylinderChangeType = cylinderChange > 0 ? 'বৃদ্ধি' : 'কমেছে';

        // Calculate old and new cylinder breakdowns by size manually
        // Since we don't have historical data, we need to reconstruct the old values
        const currentCylindersBySize = await this.getCylinderReceivablesBySize(
          data.tenantId,
          customer.name
        );

        // For old values, we subtract the total change proportionally by size
        const oldCylindersBySize: Record<string, number> = {};
        const totalCurrentCylinders = Object.values(
          currentCylindersBySize
        ).reduce((a, b) => a + b, 0);

        // If we know the total change, distribute it proportionally
        if (totalCurrentCylinders > 0) {
          Object.entries(currentCylindersBySize).forEach(
            ([size, currentQuantity]) => {
              // Calculate what the old quantity would have been
              const proportionalChange = Math.round(
                (currentQuantity / totalCurrentCylinders) *
                  Math.abs(cylinderChange)
              );
              oldCylindersBySize[size] =
                cylinderChange > 0
                  ? Math.max(0, currentQuantity - proportionalChange)
                  : currentQuantity + proportionalChange;
            }
          );
        }

        const oldFormatted =
          this.formatCylinderReceivablesBySize(oldCylindersBySize);
        const newFormatted = this.formatCylinderReceivablesBySize(
          currentCylindersBySize
        );

        cylinderChangeDetails = `🛢️ সিলিন্ডার বকেয়া পরিবর্তন:
পুরাতন: ${oldFormatted}
নতুন: ${newFormatted}
পরিবর্তন: ${this.formatNumber(Math.abs(cylinderChange))} টি (${cylinderChangeType})`;
      }

      // Get cylinder receivables by size
      const cylinderReceivablesBySize = await this.getCylinderReceivablesBySize(
        data.tenantId,
        customer.name
      );
      const formattedCylinderReceivables = this.formatCylinderReceivablesBySize(
        cylinderReceivablesBySize
      );

      // Prepare template variables
      const templateVariables: TemplateVariables = {
        driverName: customer.driver?.name || 'N/A',
        amount: this.formatCurrency(data.newCashReceivables),
        oldAmount: '0', // TODO: Calculate old amount if needed
        newAmount: this.formatCurrency(data.newCashReceivables),
        change: cashChangeDetails,
        changeType: 'increase' as const,
        date: new Date().toLocaleDateString('bn-BD'),
        time: new Date().toLocaleTimeString('bn-BD', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        // Custom properties via index signature
        customerName: customer.name,
        cashChangeDetails,
        cylinderChangeDetails,
        newCashAmount: this.formatCurrency(data.newCashReceivables),
        newCylinderAmount: this.formatNumber(data.newCylinderReceivables),
        // Also provide the template-expected variable names
        cashAmount: this.formatCurrency(data.newCashReceivables),
        cylinderAmount: this.formatNumber(data.newCylinderReceivables),
        newCylinderReceivablesBySize: formattedCylinderReceivables,
        changeReason: data.changeReason,
        areaName: customer.area?.name || 'N/A',
      };

      // Add company name if available
      const tenant = await prisma.tenant.findUnique({
        where: { id: data.tenantId },
        select: { name: true },
      });
      if (tenant) {
        templateVariables.companyName = tenant.name;
      }

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

      const totalChange = Math.abs(
        data.newCashReceivables - data.oldCashReceivables
      );
      console.log(
        `Customer receivables message sent to ${customer.name} for ${this.formatCurrency(totalChange)} change`
      );
    } catch (error) {
      console.error('Error handling customer receivables change:', error);
    }
  }

  /**
   * Handle receivables change and send appropriate messages (DISABLED FOR DRIVERS)
   */
  async handleReceivablesChange(data: ReceivablesChangeData): Promise<void> {
    // DISABLED: Driver messaging is turned off - only customers receive messages
    console.log('🚫 Driver receivables messaging disabled - customers only');
    return;
  }

  /**
   * Handle payment received (DISABLED FOR DRIVERS)
   */
  async handlePaymentReceived(data: {
    tenantId: string;
    driverId: string;
    amount: number;
    paymentType: 'cash' | 'cylinder';
    paymentId: string;
  }): Promise<void> {
    // DISABLED: Driver payment messaging is turned off - customers only
    console.log('🚫 Driver payment messaging disabled - customers only');
    return;
  }

  /**
   * Handle customer cylinder return received
   */
  async handleCustomerCylinderReturn(data: {
    tenantId: string;
    customerId: string;
    customerName: string;
    quantity: number;
    size: string;
    updatedCashReceivables?: number;
    updatedCylinderReceivables?: number;
    receivedBy?: string;
  }): Promise<void> {
    try {
      console.log('🔔 Customer cylinder return messaging triggered:', data);

      // Get customer information
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
        select: {
          id: true,
          name: true,
          phone: true,
          tenantId: true,
          area: { select: { name: true } },
          driver: { select: { name: true } },
        },
      });

      if (!customer || !customer.phone) {
        console.log(
          'Customer not found or has no phone number:',
          data.customerId
        );
        return;
      }

      // Get updated receivables information
      let updatedCashReceivables = data.updatedCashReceivables || 0;
      let updatedCylinderReceivables = data.updatedCylinderReceivables || 0;

      // If receivables not provided, try to get from customer receivables record
      if (
        data.updatedCashReceivables === undefined ||
        data.updatedCylinderReceivables === undefined
      ) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const customerReceivables =
          await prisma.customerReceivableRecord.findUnique({
            where: {
              tenantId_customerId_date: {
                tenantId: data.tenantId,
                customerId: data.customerId,
                date: today,
              },
            },
          });

        if (customerReceivables) {
          updatedCashReceivables = customerReceivables.cashReceivables;
          updatedCylinderReceivables = customerReceivables.cylinderReceivables;
        }
      }

      // Get updated cylinder receivables by size
      const updatedCylinderReceivablesBySize =
        await this.getCylinderReceivablesBySize(data.tenantId, customer.name);
      const formattedUpdatedCylinderReceivables =
        this.formatCylinderReceivablesBySize(updatedCylinderReceivablesBySize);

      // Prepare template variables for cylinder return confirmation
      const templateVariables: TemplateVariables = {
        driverName: customer.driver?.name || 'N/A',
        amount: this.formatCurrency(updatedCashReceivables),
        oldAmount: '',
        newAmount: this.formatCurrency(updatedCashReceivables),
        change: this.formatNumber(data.quantity),
        changeType: 'decrease' as const,
        date: new Date().toLocaleDateString('bn-BD'),
        time: new Date().toLocaleTimeString('bn-BD', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        // Custom properties via index signature - CONSISTENT WITH OTHER FUNCTIONS
        customerName: customer.name,
        quantity: this.formatNumber(data.quantity),
        size: data.size,
        // Use the SAME variable names as other messaging functions
        cashAmount: this.formatCurrency(updatedCashReceivables),
        newCylinderReceivablesBySize: formattedUpdatedCylinderReceivables,
        receivedBy: data.receivedBy || 'অফিস',
        areaName: customer.area?.name || 'N/A',
      };

      // Add company name if available
      const tenant = await prisma.tenant.findUnique({
        where: { id: data.tenantId },
        select: { name: true },
      });
      if (tenant) {
        templateVariables.companyName = tenant.name;
      }

      // Send cylinder return confirmation message to customer
      await this.messageService.sendReceivablesMessage({
        tenantId: data.tenantId,
        recipientType: RecipientType.CUSTOMER,
        recipientId: customer.id,
        recipientPhone: customer.phone,
        recipientName: customer.name,
        triggerType: MessageTrigger.CYLINDER_RETURN,
        triggerData: templateVariables,
        language: 'bn',
      });

      console.log(
        `Customer cylinder return confirmation sent to ${customer.name} for ${data.quantity} cylinders`
      );
    } catch (error) {
      console.error('Error handling customer cylinder return message:', error);
    }
  }

  /**
   * Handle customer payment received
   */
  async handleCustomerPaymentReceived(data: {
    tenantId: string;
    customerId: string;
    customerName: string;
    amount: number;
    paymentType: 'cash' | 'cylinder';
    paymentId: string;
    updatedCashReceivables?: number;
    updatedCylinderReceivables?: number;
    receivedBy?: string;
  }): Promise<void> {
    try {
      console.log('🔔 Customer payment messaging triggered:', data);

      // Get customer information
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
        select: {
          id: true,
          name: true,
          phone: true,
          tenantId: true,
          area: { select: { name: true } },
          driver: { select: { name: true } },
        },
      });

      if (!customer || !customer.phone) {
        console.log(
          'Customer not found or has no phone number:',
          data.customerId
        );
        return;
      }

      // Get updated receivables information
      let updatedCashReceivables = data.updatedCashReceivables || 0;
      let updatedCylinderReceivables = data.updatedCylinderReceivables || 0;

      // If receivables not provided, try to get from customer receivables record
      if (
        data.updatedCashReceivables === undefined ||
        data.updatedCylinderReceivables === undefined
      ) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const customerReceivables =
          await prisma.customerReceivableRecord.findUnique({
            where: {
              tenantId_customerId_date: {
                tenantId: data.tenantId,
                customerId: data.customerId,
                date: today,
              },
            },
          });

        if (customerReceivables) {
          updatedCashReceivables = customerReceivables.cashReceivables;
          updatedCylinderReceivables = customerReceivables.cylinderReceivables;
        }
      }

      const updatedTotalReceivables =
        updatedCashReceivables + updatedCylinderReceivables;

      // Get updated cylinder receivables by size for payment confirmation
      const updatedCylinderReceivablesBySize =
        await this.getCylinderReceivablesBySize(data.tenantId, customer.name);
      const formattedUpdatedCylinderReceivables =
        this.formatCylinderReceivablesBySize(updatedCylinderReceivablesBySize);

      // Prepare template variables for payment confirmation
      const templateVariables: TemplateVariables = {
        driverName: customer.driver?.name || 'N/A',
        amount: this.formatCurrency(data.amount),
        oldAmount: '',
        newAmount: this.formatCurrency(updatedCashReceivables),
        change: this.formatCurrency(data.amount),
        changeType: 'decrease' as const,
        date: new Date().toLocaleDateString('bn-BD'),
        time: new Date().toLocaleTimeString('bn-BD', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        // Template-expected variables for the payment confirmation template
        customerName: customer.name,
        paymentType: data.paymentType === 'cash' ? 'নগদ' : 'সিলিন্ডার',
        cylinderDeposits: this.formatNumber(0), // Default to 0 for cash payments
        updatedCashReceivables: this.formatCurrency(updatedCashReceivables),
        updatedCylinderReceivables: formattedUpdatedCylinderReceivables,
        receivedBy: data.receivedBy || 'অফিস',
        // Also keep existing names for backward compatibility
        paymentAmount: this.formatCurrency(data.amount),
        paymentMethod: data.paymentType === 'cash' ? 'নগদ' : 'সিলিন্ডার',
        cylindersReceived: this.formatNumber(0),
        cashAmount: this.formatCurrency(updatedCashReceivables),
        newCylinderReceivablesBySize: formattedUpdatedCylinderReceivables,
        areaName: customer.area?.name || 'N/A',
      };

      // Add company name if available
      const tenant = await prisma.tenant.findUnique({
        where: { id: data.tenantId },
        select: { name: true },
      });
      if (tenant) {
        templateVariables.companyName = tenant.name;
      }

      // Send payment confirmation message to customer
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

      console.log(
        `Customer payment confirmation sent to ${customer.name} for ${this.formatCurrency(data.amount)}`
      );
    } catch (error) {
      console.error('Error handling customer payment message:', error);
    }
  }

  /**
   * Handle customer receivables change with size breakdown data
   */
  async handleCustomerReceivablesChangeWithSizeBreakdown(data: {
    tenantId: string;
    customerId: string;
    oldCashReceivables: number;
    newCashReceivables: number;
    oldCylinderReceivables: number;
    newCylinderReceivables: number;
    oldCylinderSizeBreakdown: Record<string, number>;
    newCylinderSizeBreakdown: Record<string, number>;
    changeReason: string;
  }): Promise<void> {
    try {
      console.log(
        '🔔 Customer receivables messaging with size breakdown triggered:',
        data
      );

      // Get customer information
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
        select: {
          id: true,
          name: true,
          phone: true,
          tenantId: true,
          area: { select: { name: true } },
          driver: { select: { name: true } },
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

      // Skip if no significant change
      if (Math.abs(cashChange) < 0.01 && Math.abs(cylinderChange) < 1) {
        return;
      }

      // Build change details for cash and cylinder separately
      let cashChangeDetails = '';
      let cylinderChangeDetails = '';

      if (Math.abs(cashChange) >= 0.01) {
        const cashChangeType = cashChange > 0 ? 'বৃদ্ধি' : 'কমেছে';
        cashChangeDetails = `💰 নগদ বকেয়া পরিবর্তন:
পুরাতন: ${this.formatCurrency(data.oldCashReceivables)} টাকা
নতুন: ${this.formatCurrency(data.newCashReceivables)} টাকা
পরিবর্তন: ${this.formatCurrency(Math.abs(cashChange))} টাকা (${cashChangeType})`;
      }

      if (Math.abs(cylinderChange) >= 1) {
        const cylinderChangeType = cylinderChange > 0 ? 'বৃদ্ধি' : 'কমেছে';

        const oldFormatted = this.formatCylinderReceivablesBySize(
          data.oldCylinderSizeBreakdown
        );
        const newFormatted = this.formatCylinderReceivablesBySize(
          data.newCylinderSizeBreakdown
        );

        cylinderChangeDetails = `🛢️ সিলিন্ডার বকেয়া পরিবর্তন:
পুরাতন: ${oldFormatted}
নতুন: ${newFormatted}
পরিবর্তন: ${this.formatNumber(Math.abs(cylinderChange))} টি (${cylinderChangeType})`;
      }

      // Prepare template variables
      const templateVariables: TemplateVariables = {
        driverName: customer.driver?.name || 'N/A',
        amount: this.formatCurrency(data.newCashReceivables),
        oldAmount: '0', // TODO: Calculate old amount if needed
        newAmount: this.formatCurrency(data.newCashReceivables),
        change: cashChangeDetails,
        changeType: 'increase' as const,
        date: new Date().toLocaleDateString('bn-BD'),
        time: new Date().toLocaleTimeString('bn-BD', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        // Custom properties via index signature
        customerName: customer.name,
        cashChangeDetails,
        cylinderChangeDetails,
        newCashAmount: this.formatCurrency(data.newCashReceivables),
        newCylinderAmount: this.formatNumber(data.newCylinderReceivables),
        // Also provide the template-expected variable names
        cashAmount: this.formatCurrency(data.newCashReceivables),
        cylinderAmount: this.formatNumber(data.newCylinderReceivables),
        newCylinderReceivablesBySize: this.formatCylinderReceivablesBySize(
          data.newCylinderSizeBreakdown
        ),
        changeReason: data.changeReason,
        areaName: customer.area?.name || 'N/A',
      };

      // Add company name if available
      const tenant = await prisma.tenant.findUnique({
        where: { id: data.tenantId },
        select: { name: true },
      });
      if (tenant) {
        templateVariables.companyName = tenant.name;
      }

      // Send message to customer
      await this.messageService.sendReceivablesMessage({
        tenantId: data.tenantId,
        recipientType: RecipientType.CUSTOMER,
        recipientId: customer.id,
        recipientPhone: customer.phone,
        recipientName: customer.name,
        triggerType: MessageTrigger.RECEIVABLES_CHANGE,
        triggerData: templateVariables,
        language: 'bn', // Default to Bengali
      });

      console.log(
        `Customer receivables change message with size breakdown sent to ${customer.name}`
      );
    } catch (error) {
      console.error(
        'Error handling customer receivables change with size breakdown:',
        error
      );
    }
  }

  /**
   * Send daily receivables summary (DISABLED FOR DRIVERS)
   */
  async sendDailySummary(tenantId: string): Promise<void> {
    // DISABLED: Driver daily summary messaging is turned off - customers only
    console.log('🚫 Driver daily summary messaging disabled - customers only');
    return;
  }

  /**
   * Convert English numbers to Bengali numerals
   */
  private toBengaliNumber(num: number | string): string {
    const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num
      .toString()
      .replace(/\d/g, (digit) => bengaliNumerals[parseInt(digit)]);
  }

  /**
   * Format currency in Bengali locale with Bengali numerals
   */
  private formatCurrency(amount: number): string {
    // Just return the Bengali number without currency symbol since template uses "টাকা"
    return this.toBengaliNumber(amount);
  }

  /**
   * Format numbers in Bengali numerals
   */
  private formatNumber(num: number): string {
    return this.toBengaliNumber(num);
  }

  /**
   * Get cylinder receivables breakdown by size for a customer
   */
  private async getCylinderReceivablesBySize(
    tenantId: string,
    customerName: string
  ): Promise<Record<string, number>> {
    const cylinderReceivables = await prisma.customerReceivable.findMany({
      where: {
        tenantId,
        customerName,
        receivableType: 'CYLINDER',
        status: { not: 'PAID' },
      },
      select: {
        quantity: true,
        size: true,
      },
    });

    const sizeBreakdown: Record<string, number> = {};
    cylinderReceivables.forEach((receivable) => {
      const size = receivable.size || '12L'; // Default to 12L if no size specified
      sizeBreakdown[size] = (sizeBreakdown[size] || 0) + receivable.quantity;
    });

    return sizeBreakdown;
  }

  /**
   * Format cylinder receivables by size into Bengali text
   */
  private formatCylinderReceivablesBySize(
    sizeBreakdown: Record<string, number>
  ): string {
    const entries = Object.entries(sizeBreakdown);
    if (entries.length === 0) {
      return '০ টি';
    }

    return entries
      .filter(([_, quantity]) => quantity > 0)
      .map(([size, quantity]) => `${size}: ${this.formatNumber(quantity)} টি`)
      .join(', ');
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
 * Call this function whenever customer receivables are updated
 */
export async function notifyCustomerReceivablesChange(
  data: CustomerReceivablesChangeData
): Promise<void> {
  // Run in background to avoid blocking main operation
  setImmediate(async () => {
    try {
      await receivablesMessaging.handleCustomerReceivablesChange(data);
    } catch (error) {
      console.error('Error in customer receivables messaging:', error);
    }
  });
}

/**
 * Call this function when payment is received (DISABLED FOR DRIVERS)
 */
export async function notifyPaymentReceived(data: {
  tenantId: string;
  driverId: string;
  amount: number;
  paymentType: 'cash' | 'cylinder';
  paymentId: string;
}): Promise<void> {
  // DISABLED: Driver payment messaging is turned off - customers only
  console.log('🚫 Driver payment messaging disabled - customers only');
  return;
}

/**
 * Call this function when customer payment is received
 */
export async function notifyCustomerPaymentReceived(data: {
  tenantId: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentType: 'cash' | 'cylinder';
  paymentId: string;
  updatedCashReceivables?: number;
  updatedCylinderReceivables?: number;
  receivedBy?: string;
}): Promise<void> {
  setImmediate(async () => {
    try {
      await receivablesMessaging.handleCustomerPaymentReceived(data);
    } catch (error) {
      console.error('Error in customer payment messaging:', error);
    }
  });
}

/**
 * Call this function when customer returns cylinders
 */
export async function notifyCustomerCylinderReturn(data: {
  tenantId: string;
  customerId: string;
  customerName: string;
  quantity: number;
  size: string;
  updatedCashReceivables?: number;
  updatedCylinderReceivables?: number;
  receivedBy?: string;
}): Promise<void> {
  setImmediate(async () => {
    try {
      await receivablesMessaging.handleCustomerCylinderReturn(data);
    } catch (error) {
      console.error('Error in customer cylinder return messaging:', error);
    }
  });
}

/**
 * Call this function when customer receivables are updated with size breakdown data
 */
export async function notifyCustomerReceivablesChangeWithSizeBreakdown(data: {
  tenantId: string;
  customerId: string;
  oldCashReceivables: number;
  newCashReceivables: number;
  oldCylinderReceivables: number;
  newCylinderReceivables: number;
  oldCylinderSizeBreakdown: Record<string, number>;
  newCylinderSizeBreakdown: Record<string, number>;
  changeReason: string;
}): Promise<void> {
  setImmediate(async () => {
    try {
      await receivablesMessaging.handleCustomerReceivablesChangeWithSizeBreakdown(
        data
      );
    } catch (error) {
      console.error(
        'Error in customer receivables messaging with size breakdown:',
        error
      );
    }
  });
}
