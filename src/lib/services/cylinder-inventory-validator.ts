/**
 * Cylinder Inventory Validation Service
 *
 * Provides real-time inventory validation for cylinder transactions
 * to prevent insufficient inventory issues in shipments.
 *
 * Business Rules:
 * - Refill purchases require exact empty cylinder quantities by size
 * - Empty cylinder sales require exact empty cylinder quantities by size
 * - Full cylinder outgoing shipments require exact full cylinder quantities by product/size
 * - All validations use exact values from current inventory state
 */

import { PrismaClient } from '@prisma/client';
import { InventoryCalculator } from '@/lib/business';

interface CylinderInventoryItem {
  size: string;
  company?: string;
  productId?: string;
  availableQuantity: number;
  requiredQuantity: number;
}

interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  inventoryDetails: CylinderInventoryItem[];
}

interface ShipmentValidationRequest {
  tenantId: string;
  shipmentType:
    | 'INCOMING_FULL'
    | 'OUTGOING_EMPTY'
    | 'OUTGOING_FULL'
    | 'INCOMING_EMPTY';
  lineItems: Array<{
    productId?: string;
    cylinderSize: string;
    company?: string;
    quantity: number;
  }>;
  shipmentDate?: Date;
}

export class CylinderInventoryValidator {
  private prisma: PrismaClient;
  private inventoryCalculator: InventoryCalculator;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.inventoryCalculator = new InventoryCalculator(prisma);
  }

  /**
   * Validates cylinder inventory for upcoming shipments
   * Checks exact quantities available vs required by size/product
   *
   * @param request - Shipment validation details
   * @returns ValidationResult with warnings and errors
   */
  async validateShipmentInventory(
    request: ShipmentValidationRequest
  ): Promise<ValidationResult> {
    const {
      tenantId,
      shipmentType,
      lineItems,
      shipmentDate = new Date(),
    } = request;

    const result: ValidationResult = {
      isValid: true,
      warnings: [],
      errors: [],
      inventoryDetails: [],
    };

    try {
      // Get current real-time inventory state
      const currentInventory = await this.getCurrentInventoryBySize(
        tenantId,
        shipmentDate
      );

      for (const item of lineItems) {
        const validationItem: CylinderInventoryItem = {
          size: item.cylinderSize,
          company: item.company,
          productId: item.productId,
          availableQuantity: 0,
          requiredQuantity: item.quantity,
        };

        // Validate based on shipment type
        switch (shipmentType) {
          case 'INCOMING_FULL':
            // Refill purchase - requires empty cylinders to be available for exchange
            validationItem.availableQuantity =
              currentInventory.emptyCylinders[item.cylinderSize] || 0;
            await this.validateEmptyCylinderAvailability(
              validationItem,
              result
            );
            break;

          case 'OUTGOING_EMPTY':
            // Empty cylinder sale - requires empty cylinders to be in stock
            validationItem.availableQuantity =
              currentInventory.emptyCylinders[item.cylinderSize] || 0;
            await this.validateEmptyCylinderAvailability(
              validationItem,
              result
            );
            break;

          case 'OUTGOING_FULL':
            // Full cylinder outgoing - requires full cylinders by product/company
            const productKey = `${item.company}-${item.cylinderSize}`;
            validationItem.availableQuantity =
              currentInventory.fullCylinders[productKey] || 0;
            await this.validateFullCylinderAvailability(validationItem, result);
            break;

          case 'INCOMING_EMPTY':
            // Empty cylinder incoming - no validation needed (adding to inventory)
            validationItem.availableQuantity = Infinity; // Always valid
            break;

          default:
            result.errors.push(`Unsupported shipment type: ${shipmentType}`);
            result.isValid = false;
        }

        result.inventoryDetails.push(validationItem);
      }
    } catch (error) {
      console.error('Cylinder inventory validation error:', error);
      result.errors.push(
        'Failed to validate cylinder inventory. Please try again.'
      );
      result.isValid = false;
    }

    return result;
  }

  /**
   * Gets current inventory state organized by cylinder size and product
   * Uses exact calculation methodology from inventory system
   */
  private async getCurrentInventoryBySize(tenantId: string, asOfDate: Date) {
    // Get all products for the tenant
    const products = await this.prisma.product.findMany({
      where: { tenantId, isActive: true },
      include: {
        company: true,
        cylinderSize: true,
      },
    });

    const inventory = {
      fullCylinders: {} as Record<string, number>, // company-size => quantity
      emptyCylinders: {} as Record<string, number>, // size => quantity
    };

    // Calculate full cylinders by product (company-size combination)
    for (const product of products) {
      if (!product.cylinderSize) {
        console.warn(`Product ${product.id} has no cylinder size, skipping`);
        continue;
      }

      const realTimeInventory =
        await this.inventoryCalculator.getCurrentInventoryLevels(
          tenantId,
          product.id
        );

      const productKey = `${product.company.name}-${product.cylinderSize.size}`;
      inventory.fullCylinders[productKey] = realTimeInventory.fullCylinders;
    }

    // Calculate empty cylinders by size (aggregated across all companies)
    const cylinderSizes = await this.prisma.cylinderSize.findMany({
      where: {
        tenantId,
        products: { some: { isActive: true } },
      },
    });

    for (const size of cylinderSizes) {
      // Calculate empty cylinders by aggregating across all products of this size
      let totalEmptyCylinders = 0;
      
      const productsOfThisSize = products.filter(p => 
        p.cylinderSize && p.cylinderSize.size === size.size
      );
      
      for (const product of productsOfThisSize) {
        const realTimeInventory = await this.inventoryCalculator.getCurrentInventoryLevels(
          tenantId,
          product.id
        );
        totalEmptyCylinders += realTimeInventory.emptyCylinders;
      }

      inventory.emptyCylinders[size.size] = totalEmptyCylinders;
    }

    return inventory;
  }

  /**
   * Validates empty cylinder availability for transactions requiring empty cylinders
   */
  private async validateEmptyCylinderAvailability(
    item: CylinderInventoryItem,
    result: ValidationResult
  ): Promise<void> {
    if (item.availableQuantity === 0) {
      result.errors.push(
        `No empty cylinders of size ${item.size} available in inventory. ` +
          `Required: ${item.requiredQuantity}, Available: 0`
      );
      result.isValid = false;
    } else if (item.availableQuantity < item.requiredQuantity) {
      result.errors.push(
        `Insufficient empty cylinders of size ${item.size}. ` +
          `Required: ${item.requiredQuantity}, Available: ${item.availableQuantity}`
      );
      result.isValid = false;
    } else if (item.availableQuantity === item.requiredQuantity) {
      result.warnings.push(
        `Using all available empty cylinders of size ${item.size} ` +
          `(${item.availableQuantity} units). No inventory will remain.`
      );
    }
  }

  /**
   * Validates full cylinder availability for outgoing shipments
   */
  private async validateFullCylinderAvailability(
    item: CylinderInventoryItem,
    result: ValidationResult
  ): Promise<void> {
    const productDescription = item.company
      ? `${item.company} ${item.size}`
      : item.size;

    if (item.availableQuantity === 0) {
      result.errors.push(
        `No full cylinders of ${productDescription} available in inventory. ` +
          `Required: ${item.requiredQuantity}, Available: 0`
      );
      result.isValid = false;
    } else if (item.availableQuantity < item.requiredQuantity) {
      result.errors.push(
        `Insufficient full cylinders of ${productDescription}. ` +
          `Required: ${item.requiredQuantity}, Available: ${item.availableQuantity}`
      );
      result.isValid = false;
    } else if (item.availableQuantity === item.requiredQuantity) {
      result.warnings.push(
        `Using all available full cylinders of ${productDescription} ` +
          `(${item.availableQuantity} units). No inventory will remain.`
      );
    }
  }

  /**
   * Quick validation for single cylinder type
   * Useful for UI validation before full shipment creation
   */
  async validateSingleCylinderType(
    tenantId: string,
    cylinderSize: string,
    requiredQuantity: number,
    type: 'full' | 'empty',
    company?: string
  ): Promise<{ isValid: boolean; available: number; message?: string }> {
    try {
      const currentInventory = await this.getCurrentInventoryBySize(
        tenantId,
        new Date()
      );

      let availableQuantity = 0;

      if (type === 'empty') {
        availableQuantity = currentInventory.emptyCylinders[cylinderSize] || 0;
      } else {
        const productKey = company
          ? `${company}-${cylinderSize}`
          : cylinderSize;
        availableQuantity = currentInventory.fullCylinders[productKey] || 0;
      }

      const isValid = availableQuantity >= requiredQuantity;
      let message: string | undefined;

      if (!isValid) {
        message =
          availableQuantity === 0
            ? `No ${type} cylinders of size ${cylinderSize} available`
            : `Only ${availableQuantity} ${type} cylinders of size ${cylinderSize} available, need ${requiredQuantity}`;
      }

      return {
        isValid,
        available: availableQuantity,
        message,
      };
    } catch (error) {
      console.error('Single cylinder validation error:', error);
      return {
        isValid: false,
        available: 0,
        message: 'Unable to validate cylinder inventory',
      };
    }
  }
}

export default CylinderInventoryValidator;
