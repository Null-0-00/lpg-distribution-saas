// Combined Sales API Endpoint
// Handles combined sales entries with multiple items for a single driver

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { InventoryCalculator, BusinessValidator } from '@/lib/business';
import { ReceivablesCalculator } from '@/lib/business/receivables';
import { SaleType, PaymentType } from '@prisma/client';
import { z } from 'zod';

const combinedSaleSchema = z.object({
  driverId: z.string().cuid(),
  customerName: z.string().optional(),
  saleItems: z
    .array(
      z
        .object({
          productId: z.string().cuid(),
          packageSale: z.number().min(0).default(0),
          refillSale: z.number().min(0).default(0),
          packagePrice: z.number().min(0).default(0),
          refillPrice: z.number().min(0).default(0),
        })
        .refine(
          (item) => {
            // If there's a package sale, price must be > 0
            if (item.packageSale > 0 && item.packagePrice <= 0) {
              return false;
            }
            // If there's a refill sale, price must be > 0
            if (item.refillSale > 0 && item.refillPrice <= 0) {
              return false;
            }
            return true;
          },
          {
            message: 'Price must be greater than 0 when quantity is specified',
          }
        )
    )
    .min(1),
  paymentType: z.nativeEnum(PaymentType),
  discount: z.number().min(0).default(0),
  cashDeposited: z.number().min(0).default(0),
  cylinderDeposits: z.record(z.string(), z.number().int().min(0)).optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, role, id: userId } = session.user;

    // Validate user permissions
    const permissionCheck = BusinessValidator.validateUserPermission(
      role,
      'CREATE_SALE'
    );
    if (!permissionCheck.isValid) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = combinedSaleSchema.parse(body);

    // Calculate totals
    let totalValue = 0;
    let totalRefillQuantity = 0;
    let totalPackageQuantity = 0;
    let totalQuantity = 0;

    validatedData.saleItems.forEach((item) => {
      const packageValue = item.packageSale * item.packagePrice;
      const refillValue = item.refillSale * item.refillPrice;
      totalValue += packageValue + refillValue;

      totalPackageQuantity += item.packageSale;
      totalRefillQuantity += item.refillSale;
      totalQuantity += item.packageSale + item.refillSale;
    });

    const totalDiscount = validatedData.discount || 0;
    const netValue = totalValue - totalDiscount;

    // Validation: Ensure total value is greater than 0
    if (totalValue <= 0) {
      return NextResponse.json(
        {
          error:
            'Total sale value must be greater than 0. Please check quantities and prices.',
        },
        { status: 400 }
      );
    }

    // Validation: Ensure net value is not negative
    if (netValue < 0) {
      return NextResponse.json(
        {
          error: 'Discount cannot exceed total sale value.',
        },
        { status: 400 }
      );
    }

    // Calculate total cylinder deposits
    const totalCylinderDeposits = Object.values(
      validatedData.cylinderDeposits || {}
    ).reduce((sum, count) => sum + count, 0);

    // Business validation for combined sale
    const businessValidation = BusinessValidator.validateSale({
      quantity: totalQuantity,
      paymentType: validatedData.paymentType,
      saleType: SaleType.PACKAGE, // Use PACKAGE as default for combined sales
      cashDeposited: validatedData.cashDeposited,
      netValue: netValue,
      cylindersDeposited: totalCylinderDeposits,
      isOnCredit: validatedData.paymentType === PaymentType.CREDIT,
    });

    if (!businessValidation.isValid) {
      return NextResponse.json(
        {
          error: businessValidation.errors.join(', '),
        },
        { status: 400 }
      );
    }

    // Verify driver exists and is active
    const driver = await prisma.driver.findFirst({
      where: {
        id: validatedData.driverId,
        tenantId,
        status: 'ACTIVE',
      },
    });

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found or inactive' },
        { status: 404 }
      );
    }

    // Verify all products exist and belong to tenant
    const productIds = validatedData.saleItems
      .map((item) => item.productId)
      .filter((id) => id && id.trim() !== '');
    const uniqueProductIds = [...new Set(productIds)]; // Remove duplicates
    console.log('Requested product IDs:', productIds);
    console.log('Unique product IDs:', uniqueProductIds);
    console.log('Sale items:', validatedData.saleItems);

    if (uniqueProductIds.length === 0) {
      return NextResponse.json(
        { error: 'No valid products selected' },
        { status: 400 }
      );
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: uniqueProductIds },
        tenantId,
        isActive: true,
      },
    });

    console.log(
      'Found products:',
      products.map((p) => ({ id: p.id, name: p.name, isActive: p.isActive }))
    );

    if (products.length !== uniqueProductIds.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = uniqueProductIds.filter(
        (id) => !foundIds.includes(id)
      );
      console.log('Missing product IDs:', missingIds);
      return NextResponse.json(
        {
          error: 'Some products not found or inactive',
          details: { requestedIds: uniqueProductIds, foundIds, missingIds },
        },
        { status: 404 }
      );
    }

    // Check inventory levels for all products
    const inventoryCalculator = new InventoryCalculator(prisma);
    const receivablesCalculator = new ReceivablesCalculator(prisma);

    for (const item of validatedData.saleItems) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      const currentLevels = await inventoryCalculator.getCurrentInventoryLevels(
        tenantId,
        item.productId
      );

      const totalItemQuantity = item.packageSale + item.refillSale;
      if (currentLevels.fullCylinders < totalItemQuantity) {
        return NextResponse.json(
          {
            error: `Insufficient inventory for ${product.name}. Available: ${currentLevels.fullCylinders}, Requested: ${totalItemQuantity}`,
          },
          { status: 400 }
        );
      }
    }

    // Create all sales in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdSales = [];

      for (const item of validatedData.saleItems) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) continue;

        // Calculate item totals
        const packageValue = item.packageSale * item.packagePrice;
        const refillValue = item.refillSale * item.refillPrice;
        const itemTotal = packageValue + refillValue;

        // Calculate proportional discount and payment distribution
        const itemDiscountPortion =
          totalValue > 0 && totalDiscount > 0
            ? (itemTotal / totalValue) * totalDiscount
            : 0;
        const itemNetValue = itemTotal - itemDiscountPortion;
        const itemCashDeposited =
          netValue > 0 && itemNetValue > 0
            ? (itemNetValue / netValue) * validatedData.cashDeposited
            : 0;

        // Declare variables for sale records
        let packageSale: any = null;
        let refillSale: any = null;

        // Create package sale if quantity > 0
        if (item.packageSale > 0) {
          const packageNet =
            packageValue -
            (itemTotal > 0
              ? (packageValue / itemTotal) * itemDiscountPortion
              : 0);
          const packageCashDeposited =
            netValue > 0 && packageNet > 0
              ? (packageNet / netValue) * validatedData.cashDeposited
              : 0;

          packageSale = await tx.sale.create({
            data: {
              tenantId,
              driverId: validatedData.driverId,
              productId: item.productId,
              userId: userId,
              customerName: validatedData.customerName,
              saleType: SaleType.PACKAGE,
              quantity: item.packageSale,
              unitPrice: item.packagePrice,
              totalValue: packageValue,
              discount: (packageValue / itemTotal) * itemDiscountPortion,
              netValue: packageNet,
              paymentType: validatedData.paymentType,
              cashDeposited: packageCashDeposited,
              cylindersDeposited: 0, // Package sales don't have cylinder deposits
              notes: validatedData.notes,
              saleDate: new Date(),
            },
            include: {
              driver: { select: { id: true, name: true, phone: true } },
              product: {
                select: {
                  id: true,
                  name: true,
                  size: true,
                  company: { select: { name: true } },
                },
              },
            },
          });
          createdSales.push(packageSale);
        }

        // Create refill sale if quantity > 0
        if (item.refillSale > 0) {
          const refillNet =
            refillValue -
            (itemTotal > 0
              ? (refillValue / itemTotal) * itemDiscountPortion
              : 0);
          const refillCashDeposited =
            netValue > 0 && refillNet > 0
              ? (refillNet / netValue) * validatedData.cashDeposited
              : 0;

          // Get cylinder deposits for this specific product size
          const productSize = product?.size || '';
          const refillCylindersDeposited = Math.min(
            item.refillSale,
            validatedData.cylinderDeposits?.[productSize] || 0
          );

          refillSale = await tx.sale.create({
            data: {
              tenantId,
              driverId: validatedData.driverId,
              productId: item.productId,
              userId: userId,
              customerName: validatedData.customerName,
              saleType: SaleType.REFILL,
              quantity: item.refillSale,
              unitPrice: item.refillPrice,
              totalValue: refillValue,
              discount: (refillValue / itemTotal) * itemDiscountPortion,
              netValue: refillNet,
              paymentType: validatedData.paymentType,
              cashDeposited: refillCashDeposited,
              cylindersDeposited: refillCylindersDeposited,
              notes: validatedData.notes,
              saleDate: new Date(),
            },
            include: {
              driver: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                },
              },
              product: {
                select: {
                  id: true,
                  name: true,
                  size: true,
                  company: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          });

          createdSales.push(refillSale);
        }

        // Record inventory movements for both package and refill sales
        if (item.packageSale > 0 && packageSale) {
          await inventoryCalculator.recordInventoryMovement(
            tenantId,
            item.productId,
            'SALE_PACKAGE',
            item.packageSale,
            `Package sale to ${driver.name}`,
            packageSale.id,
            validatedData.driverId
          );
        }

        if (item.refillSale > 0 && refillSale) {
          await inventoryCalculator.recordInventoryMovement(
            tenantId,
            item.productId,
            'SALE_REFILL',
            item.refillSale,
            `Refill sale to ${driver.name}`,
            refillSale.id,
            validatedData.driverId
          );
        }
      }

      // Note: Receivables calculation will be done after transaction completes
      // to avoid transaction conflicts

      // Create customer receivables for tracking individual customer debts
      if (validatedData.cashDeposited < netValue) {
        const cashReceivable = netValue - validatedData.cashDeposited;

        await tx.customerReceivable.create({
          data: {
            tenantId,
            driverId: validatedData.driverId,
            customerName: validatedData.customerName || 'Walk-in Customer',
            receivableType: 'CASH',
            amount: cashReceivable,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            status: 'CURRENT',
          },
        });
      }

      // Create cylinder receivables per product size
      if (totalRefillQuantity > totalCylinderDeposits) {
        // Group refill sales by product size
        const refillBySize = new Map();

        validatedData.saleItems.forEach((item) => {
          if (item.refillSale > 0) {
            const product = products.find((p) => p.id === item.productId);
            if (product) {
              const size = product.size;
              refillBySize.set(
                size,
                (refillBySize.get(size) || 0) + item.refillSale
              );
            }
          }
        });

        // Create receivables by size using specific deposits
        for (const [size, refillQuantity] of refillBySize) {
          const depositsForSize = validatedData.cylinderDeposits?.[size] || 0;
          const cylinderReceivable = refillQuantity - depositsForSize;

          if (cylinderReceivable > 0) {
            await tx.customerReceivable.create({
              data: {
                tenantId,
                driverId: validatedData.driverId,
                customerName: validatedData.customerName || 'Walk-in Customer',
                receivableType: 'CYLINDER',
                quantity: cylinderReceivable,
                size: size,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                status: 'CURRENT',
              },
            });
          }
        }
      }

      return createdSales;
    });

    // Update receivables after transaction completes (to avoid transaction conflicts)
    setImmediate(async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get previous day's receivables for this driver
        const previousReceivables =
          await receivablesCalculator.getPreviousReceivables(
            tenantId,
            validatedData.driverId,
            today
          );

        // Calculate receivables using exact formulas
        const receivablesData =
          await receivablesCalculator.calculateReceivablesForDate({
            date: today,
            tenantId,
            driverId: validatedData.driverId,
            previousCashReceivables: previousReceivables.cashReceivables,
            previousCylinderReceivables:
              previousReceivables.cylinderReceivables,
          });

        // Store the calculated receivables in the database
        await receivablesCalculator.updateReceivablesRecord(
          tenantId,
          validatedData.driverId,
          today,
          receivablesData
        );

        console.log(
          `✅ Receivables updated for driver ${validatedData.driverId} after combined sales`
        );
      } catch (receivablesError) {
        console.error('Error updating receivables:', receivablesError);
      }
    });

    return NextResponse.json(
      {
        success: true,
        sales: result,
        message: `Combined sale created successfully with ${result.length} items`,
        summary: {
          totalItems: result.length,
          totalQuantity,
          totalValue,
          totalDiscount,
          netValue,
          cashDeposited: validatedData.cashDeposited,
          cylindersDeposited: totalCylinderDeposits,
          cylinderDepositsBySize: validatedData.cylinderDeposits,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Combined sale creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid input data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
