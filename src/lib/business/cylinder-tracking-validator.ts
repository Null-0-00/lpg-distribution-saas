// Cylinder Tracking Validation and Error Handling
// Comprehensive validation rules and error handling for cylinder tracking system

import { PrismaClient } from '@prisma/client';
import {
  CylinderTrackingInput,
  CylinderValidationError,
  CylinderEventType,
  CylinderBusinessRules
} from '@/types/cylinder-tracking';

export class CylinderTrackingValidator {
  private readonly businessRules: CylinderBusinessRules;

  constructor(
    private prisma: PrismaClient,
    businessRules?: Partial<CylinderBusinessRules>
  ) {
    this.businessRules = {
      validateQuantities: true,
      validateReceivables: true,
      validateInventoryBalance: true,
      validateOnboardingBaseline: true,
      enforceNonNegativeInventory: true,
      validateEventSequence: true,
      ...businessRules
    };
  }

  /**
   * Validate cylinder tracking input data
   */
  async validateCylinderTrackingInput(
    input: CylinderTrackingInput
  ): Promise<CylinderValidationError[]> {
    const errors: CylinderValidationError[] = [];

    // Basic field validation
    errors.push(...this.validateBasicFields(input));

    // Tenant validation
    errors.push(...await this.validateTenant(input.tenantId));

    // Cylinder size validation
    errors.push(...await this.validateCylinderSize(input.tenantId, input.cylinderSizeId));

    // Product validation (if provided)
    if (input.productId) {
      errors.push(...await this.validateProduct(input.tenantId, input.productId, input.cylinderSizeId));
    }

    // Event-specific validation
    errors.push(...this.validateEventSpecificData(input));

    // Business rule validation
    if (this.businessRules.validateQuantities) {
      errors.push(...this.validateQuantities(input));
    }

    if (this.businessRules.validateInventoryBalance) {
      errors.push(...await this.validateInventoryBalance(input));
    }

    if (this.businessRules.validateOnboardingBaseline && input.eventType === CylinderEventType.ONBOARDING) {
      errors.push(...this.validateOnboardingBaseline(input));
    }

    if (this.businessRules.validateEventSequence) {
      errors.push(...await this.validateEventSequence(input));
    }

    return errors;
  }

  /**
   * Validate basic required fields
   */
  private validateBasicFields(input: CylinderTrackingInput): CylinderValidationError[] {
    const errors: CylinderValidationError[] = [];

    if (!input.tenantId) {
      errors.push({
        field: 'tenantId',
        message: 'Tenant ID is required'
      });
    }

    if (!input.cylinderSizeId) {
      errors.push({
        field: 'cylinderSizeId',
        message: 'Cylinder Size ID is required'
      });
    }

    if (!input.date) {
      errors.push({
        field: 'date',
        message: 'Date is required'
      });
    } else if (input.date > new Date()) {
      errors.push({
        field: 'date',
        message: 'Date cannot be in the future',
        value: input.date
      });
    }

    if (!input.eventType) {
      errors.push({
        field: 'eventType',
        message: 'Event type is required'
      });
    }

    return errors;
  }

  /**
   * Validate tenant exists and is active
   */
  private async validateTenant(tenantId: string): Promise<CylinderValidationError[]> {
    const errors: CylinderValidationError[] = [];

    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { isActive: true }
      });

      if (!tenant) {
        errors.push({
          field: 'tenantId',
          message: 'Tenant not found',
          value: tenantId
        });
      } else if (!tenant.isActive) {
        errors.push({
          field: 'tenantId',
          message: 'Tenant is not active',
          value: tenantId
        });
      }
    } catch (error) {
      errors.push({
        field: 'tenantId',
        message: 'Error validating tenant',
        value: tenantId
      });
    }

    return errors;
  }

  /**
   * Validate cylinder size exists and belongs to tenant
   */
  private async validateCylinderSize(
    tenantId: string, 
    cylinderSizeId: string
  ): Promise<CylinderValidationError[]> {
    const errors: CylinderValidationError[] = [];

    try {
      const cylinderSize = await this.prisma.cylinderSize.findUnique({
        where: { id: cylinderSizeId },
        select: { tenantId: true, isActive: true, size: true }
      });

      if (!cylinderSize) {
        errors.push({
          field: 'cylinderSizeId',
          message: 'Cylinder size not found',
          value: cylinderSizeId
        });
      } else if (cylinderSize.tenantId !== tenantId) {
        errors.push({
          field: 'cylinderSizeId',
          message: 'Cylinder size does not belong to this tenant',
          value: cylinderSizeId
        });
      } else if (!cylinderSize.isActive) {
        errors.push({
          field: 'cylinderSizeId',
          message: 'Cylinder size is not active',
          value: cylinderSize.size
        });
      }
    } catch (error) {
      errors.push({
        field: 'cylinderSizeId',
        message: 'Error validating cylinder size',
        value: cylinderSizeId
      });
    }

    return errors;
  }

  /**
   * Validate product exists, belongs to tenant, and matches cylinder size
   */
  private async validateProduct(
    tenantId: string, 
    productId: string, 
    cylinderSizeId: string
  ): Promise<CylinderValidationError[]> {
    const errors: CylinderValidationError[] = [];

    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        select: { 
          tenantId: true, 
          isActive: true, 
          name: true, 
          cylinderSizeId: true 
        }
      });

      if (!product) {
        errors.push({
          field: 'productId',
          message: 'Product not found',
          value: productId
        });
      } else {
        if (product.tenantId !== tenantId) {
          errors.push({
            field: 'productId',
            message: 'Product does not belong to this tenant',
            value: productId
          });
        }

        if (!product.isActive) {
          errors.push({
            field: 'productId',
            message: 'Product is not active',
            value: product.name
          });
        }

        if (product.cylinderSizeId !== cylinderSizeId) {
          errors.push({
            field: 'productId',
            message: 'Product cylinder size does not match specified cylinder size',
            value: `${product.name} (expected: ${cylinderSizeId}, actual: ${product.cylinderSizeId})`
          });
        }
      }
    } catch (error) {
      errors.push({
        field: 'productId',
        message: 'Error validating product',
        value: productId
      });
    }

    return errors;
  }

  /**
   * Validate event-specific data
   */
  private validateEventSpecificData(input: CylinderTrackingInput): CylinderValidationError[] {
    const errors: CylinderValidationError[] = [];

    switch (input.eventType) {
      case CylinderEventType.ONBOARDING:
        if (!input.onboardingData) {
          errors.push({
            field: 'onboardingData',
            message: 'Onboarding data is required for onboarding events'
          });
        } else {
          errors.push(...this.validateOnboardingData(input.onboardingData));
        }
        break;

      case CylinderEventType.SALES:
        if (!input.salesData) {
          errors.push({
            field: 'salesData',
            message: 'Sales data is required for sales events'
          });
        } else {
          errors.push(...this.validateSalesData(input.salesData));
        }
        break;

      case CylinderEventType.SHIPMENT:
        if (!input.shipmentData) {
          errors.push({
            field: 'shipmentData',
            message: 'Shipment data is required for shipment events'
          });
        } else {
          errors.push(...this.validateShipmentData(input.shipmentData));
        }
        break;
    }

    return errors;
  }

  /**
   * Validate onboarding data
   */
  private validateOnboardingData(data: any): CylinderValidationError[] {
    const errors: CylinderValidationError[] = [];

    if (data.onboardingFullCylinders < 0) {
      errors.push({
        field: 'onboardingFullCylinders',
        message: 'Onboarding full cylinders cannot be negative',
        value: data.onboardingFullCylinders
      });
    }

    if (data.onboardingEmptyCylinders < 0) {
      errors.push({
        field: 'onboardingEmptyCylinders',
        message: 'Onboarding empty cylinders cannot be negative',
        value: data.onboardingEmptyCylinders
      });
    }

    if (data.onboardingCylinderReceivables < 0) {
      errors.push({
        field: 'onboardingCylinderReceivables',
        message: 'Onboarding cylinder receivables cannot be negative',
        value: data.onboardingCylinderReceivables
      });
    }

    return errors;
  }

  /**
   * Validate sales data
   */
  private validateSalesData(data: any): CylinderValidationError[] {
    const errors: CylinderValidationError[] = [];

    if (data.salesPackageQuantity < 0 || data.salesRefillQuantity < 0) {
      errors.push({
        field: 'salesQuantity',
        message: 'Sales quantities cannot be negative',
        value: { package: data.salesPackageQuantity, refill: data.salesRefillQuantity }
      });
    }

    if (data.salesPackageRevenue < 0 || data.salesRefillRevenue < 0) {
      errors.push({
        field: 'salesRevenue',
        message: 'Sales revenue cannot be negative',
        value: { package: data.salesPackageRevenue, refill: data.salesRefillRevenue }
      });
    }

    if (data.salesCashDeposited < 0) {
      errors.push({
        field: 'salesCashDeposited',
        message: 'Sales cash deposited cannot be negative',
        value: data.salesCashDeposited
      });
    }

    if (data.salesCylinderDeposited < 0) {
      errors.push({
        field: 'salesCylinderDeposited',
        message: 'Sales cylinder deposited cannot be negative',
        value: data.salesCylinderDeposited
      });
    }

    return errors;
  }

  /**
   * Validate shipment data
   */
  private validateShipmentData(data: any): CylinderValidationError[] {
    const errors: CylinderValidationError[] = [];

    const quantities = [
      data.shipmentIncomingFullQuantity,
      data.shipmentIncomingEmptyQuantity,
      data.shipmentOutgoingFullQuantity,
      data.shipmentOutgoingEmptyQuantity
    ];

    if (quantities.some(q => q < 0)) {
      errors.push({
        field: 'shipmentQuantities',
        message: 'Shipment quantities cannot be negative',
        value: quantities
      });
    }

    if (data.shipmentTotalCost < 0) {
      errors.push({
        field: 'shipmentTotalCost',
        message: 'Shipment total cost cannot be negative',
        value: data.shipmentTotalCost
      });
    }

    return errors;
  }

  /**
   * Validate quantities according to business rules
   */
  private validateQuantities(input: CylinderTrackingInput): CylinderValidationError[] {
    const errors: CylinderValidationError[] = [];

    if (this.businessRules.enforceNonNegativeInventory) {
      if (input.inventoryData?.fullCylinders !== undefined && input.inventoryData.fullCylinders < 0) {
        errors.push({
          field: 'fullCylinders',
          message: 'Full cylinders inventory cannot be negative',
          value: input.inventoryData.fullCylinders
        });
      }

      if (input.inventoryData?.emptyCylinders !== undefined && input.inventoryData.emptyCylinders < 0) {
        errors.push({
          field: 'emptyCylinders',
          message: 'Empty cylinders inventory cannot be negative',
          value: input.inventoryData.emptyCylinders
        });
      }
    }

    return errors;
  }

  /**
   * Validate inventory balance makes sense
   */
  private async validateInventoryBalance(
    input: CylinderTrackingInput
  ): Promise<CylinderValidationError[]> {
    const errors: CylinderValidationError[] = [];

    // Check if total cylinders equals full + empty
    if (input.inventoryData?.totalCylinders !== undefined &&
        input.inventoryData?.fullCylinders !== undefined &&
        input.inventoryData?.emptyCylinders !== undefined) {
      
      const calculatedTotal = input.inventoryData.fullCylinders + input.inventoryData.emptyCylinders;
      if (input.inventoryData.totalCylinders !== calculatedTotal) {
        errors.push({
          field: 'totalCylinders',
          message: 'Total cylinders must equal full cylinders plus empty cylinders',
          value: {
            provided: input.inventoryData.totalCylinders,
            calculated: calculatedTotal,
            full: input.inventoryData.fullCylinders,
            empty: input.inventoryData.emptyCylinders
          }
        });
      }
    }

    return errors;
  }

  /**
   * Validate onboarding baseline requirements
   */
  private validateOnboardingBaseline(input: CylinderTrackingInput): CylinderValidationError[] {
    const errors: CylinderValidationError[] = [];

    if (input.eventType === CylinderEventType.ONBOARDING) {
      if (!input.onboardingData?.onboardingDate) {
        errors.push({
          field: 'onboardingDate',
          message: 'Onboarding date is required for onboarding events'
        });
      }

      // Ensure at least some data is being recorded
      if (input.onboardingData &&
          input.onboardingData.onboardingFullCylinders === 0 &&
          input.onboardingData.onboardingEmptyCylinders === 0 &&
          input.onboardingData.onboardingCylinderReceivables === 0) {
        
        errors.push({
          field: 'onboardingData',
          message: 'Onboarding must record at least some cylinders or receivables',
          value: input.onboardingData
        });
      }
    }

    return errors;
  }

  /**
   * Validate event sequence makes logical sense
   */
  private async validateEventSequence(
    input: CylinderTrackingInput
  ): Promise<CylinderValidationError[]> {
    const errors: CylinderValidationError[] = [];

    try {
      // Check if onboarding has been completed for this cylinder size
      const hasOnboarding = await this.prisma.inventoryRecord.findFirst({
        where: {
          tenantId: input.tenantId,
          cylinderSizeId: input.cylinderSizeId,
          eventType: CylinderEventType.ONBOARDING
        }
      });

      if (!hasOnboarding && input.eventType !== CylinderEventType.ONBOARDING) {
        errors.push({
          field: 'eventType',
          message: 'Onboarding must be completed before other cylinder tracking events',
          value: input.eventType
        });
      }

      // Prevent duplicate onboarding for the same cylinder size
      if (hasOnboarding && input.eventType === CylinderEventType.ONBOARDING) {
        errors.push({
          field: 'eventType',
          message: 'Onboarding has already been completed for this cylinder size',
          value: input.cylinderSizeId
        });
      }

    } catch (error) {
      // Non-critical validation error
      console.warn('Error validating event sequence:', error);
    }

    return errors;
  }

  /**
   * Validate and sanitize input data
   */
  sanitizeInput(input: CylinderTrackingInput): CylinderTrackingInput {
    // Ensure dates are properly formatted
    const sanitized = { ...input };
    
    if (sanitized.date) {
      sanitized.date = new Date(sanitized.date);
      sanitized.date.setHours(0, 0, 0, 0); // Normalize to start of day
    }

    // Round numerical values to prevent floating point precision issues
    if (sanitized.salesData) {
      sanitized.salesData = {
        ...sanitized.salesData,
        salesPackageRevenue: Math.round((sanitized.salesData.salesPackageRevenue || 0) * 100) / 100,
        salesRefillRevenue: Math.round((sanitized.salesData.salesRefillRevenue || 0) * 100) / 100,
        salesTotalRevenue: Math.round((sanitized.salesData.salesTotalRevenue || 0) * 100) / 100,
        salesCashDeposited: Math.round((sanitized.salesData.salesCashDeposited || 0) * 100) / 100,
        salesDiscounts: Math.round((sanitized.salesData.salesDiscounts || 0) * 100) / 100,
        salesNetRevenue: Math.round((sanitized.salesData.salesNetRevenue || 0) * 100) / 100
      };
    }

    if (sanitized.shipmentData) {
      sanitized.shipmentData = {
        ...sanitized.shipmentData,
        shipmentTotalCost: Math.round((sanitized.shipmentData.shipmentTotalCost || 0) * 100) / 100
      };
    }

    if (sanitized.receivablesData) {
      sanitized.receivablesData = {
        ...sanitized.receivablesData,
        cashReceivablesChange: Math.round((sanitized.receivablesData.cashReceivablesChange || 0) * 100) / 100,
        totalCashReceivables: Math.round((sanitized.receivablesData.totalCashReceivables || 0) * 100) / 100
      };
    }

    return sanitized;
  }
}