// Individual Sale API Endpoints - Edit and Delete
// Handles single sale operations with business validation

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/database/client';
import { InventoryCalculator, BusinessValidator } from '@/lib/business';
import { SaleType, PaymentType } from '@prisma/client';
import { z } from 'zod';

const updateSaleSchema = z.object({
  driverId: z.string().cuid().optional(),
  productId: z.string().cuid().optional(),
  saleType: z.nativeEnum(SaleType).optional(),
  quantity: z.number().int().min(1).max(1000).optional(),
  unitPrice: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  paymentType: z.nativeEnum(PaymentType).optional(),
  cashDeposited: z.number().min(0).optional(),
  cylindersDeposited: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, role, id: userId } = session.user;
    const saleId = id;

    // Validate user permissions
    const permissionCheck = BusinessValidator.validateUserPermission(
      role,
      'UPDATE_SALE'
    );
    if (!permissionCheck.isValid) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check if sale exists and belongs to tenant
    const existingSale = await prisma.sale.findFirst({
      where: { id: saleId, tenantId },
      include: {
        driver: { select: { name: true } },
        product: { select: { name: true, size: true } },
      },
    });

    if (!existingSale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    // Only allow editing today's sales
    const saleDate = new Date(existingSale.saleDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    saleDate.setHours(0, 0, 0, 0);

    if (saleDate.getTime() !== today.getTime()) {
      return NextResponse.json(
        {
          error: "Can only edit today's sales",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateSaleSchema.parse(body);

    // If no changes provided, return current sale
    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json({ sale: existingSale });
    }

    // Calculate new values if quantity or price changed
    let totalValue = existingSale.totalValue;
    let netValue = existingSale.netValue;

    if (
      validatedData.quantity !== undefined ||
      validatedData.unitPrice !== undefined
    ) {
      const newQuantity = validatedData.quantity ?? existingSale.quantity;
      const newUnitPrice = validatedData.unitPrice ?? existingSale.unitPrice;
      const newDiscount = validatedData.discount ?? existingSale.discount;

      totalValue = newQuantity * newUnitPrice;
      netValue = totalValue - newDiscount;
    }

    // Business validation for updated values
    if (
      validatedData.quantity !== undefined ||
      validatedData.unitPrice !== undefined ||
      validatedData.discount !== undefined ||
      validatedData.paymentType !== undefined ||
      validatedData.cashDeposited !== undefined
    ) {
      const businessValidation = BusinessValidator.validateSale({
        quantity: validatedData.quantity ?? existingSale.quantity,
        paymentType: validatedData.paymentType ?? existingSale.paymentType,
        saleType: validatedData.saleType ?? existingSale.saleType,
        cashDeposited:
          validatedData.cashDeposited ?? existingSale.cashDeposited,
        netValue,
        cylindersDeposited:
          validatedData.cylindersDeposited ?? existingSale.cylindersDeposited,
        isOnCredit:
          (validatedData.cashDeposited ?? existingSale.cashDeposited) <
          netValue,
      });

      if (!businessValidation.isValid) {
        return NextResponse.json(
          {
            error: 'Business validation failed',
            details: businessValidation.errors,
          },
          { status: 400 }
        );
      }
    }

    // Check inventory if quantity increased
    if (
      validatedData.quantity &&
      validatedData.quantity > existingSale.quantity
    ) {
      const inventoryCalculator = new InventoryCalculator(prisma);
      const productId = validatedData.productId ?? existingSale.productId;
      const currentLevels = await inventoryCalculator.getCurrentInventoryLevels(
        tenantId,
        productId
      );

      const additionalQuantity = validatedData.quantity - existingSale.quantity;
      if (currentLevels.fullCylinders < additionalQuantity) {
        return NextResponse.json(
          {
            error: 'Insufficient inventory for increased quantity',
            available: currentLevels.fullCylinders,
            requested: additionalQuantity,
          },
          { status: 400 }
        );
      }
    }

    // Update sale in transaction
    const updatedSale = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.update({
        where: { id: saleId },
        data: {
          ...(validatedData.driverId && { driverId: validatedData.driverId }),
          ...(validatedData.productId && {
            productId: validatedData.productId,
          }),
          ...(validatedData.saleType && { saleType: validatedData.saleType }),
          ...(validatedData.quantity && { quantity: validatedData.quantity }),
          ...(validatedData.unitPrice && {
            unitPrice: validatedData.unitPrice,
          }),
          ...(validatedData.discount !== undefined && {
            discount: validatedData.discount,
          }),
          ...(validatedData.paymentType && {
            paymentType: validatedData.paymentType,
          }),
          ...(validatedData.cashDeposited !== undefined && {
            cashDeposited: validatedData.cashDeposited,
          }),
          ...(validatedData.cylindersDeposited !== undefined && {
            cylindersDeposited: validatedData.cylindersDeposited,
          }),
          ...(validatedData.notes !== undefined && {
            notes: validatedData.notes,
          }),
          totalValue,
          netValue,
          isOnCredit:
            (validatedData.cashDeposited ?? existingSale.cashDeposited) <
            netValue,
          isCylinderCredit:
            (validatedData.saleType ?? existingSale.saleType) ===
              SaleType.REFILL &&
            (validatedData.cylindersDeposited ??
              existingSale.cylindersDeposited) <
              (validatedData.quantity ?? existingSale.quantity),
        },
        include: {
          driver: { select: { name: true } },
          product: {
            select: {
              name: true,
              size: true,
              company: { select: { name: true } },
            },
          },
        },
      });

      // Record the update in audit log
      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          action: 'UPDATE',
          entityType: 'Sale',
          entityId: saleId,
          oldValues: JSON.stringify(existingSale),
          newValues: JSON.stringify(sale),
          metadata: {
            reason: 'Sale edit',
            updatedFields: Object.keys(validatedData),
          },
        },
      });

      return sale;
    });

    return NextResponse.json({
      success: true,
      sale: {
        id: updatedSale.id,
        saleType: updatedSale.saleType,
        quantity: updatedSale.quantity,
        netValue: updatedSale.netValue,
        driver: updatedSale.driver.name,
        saleDate: updatedSale.saleDate,
        updatedAt: updatedSale.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Sale update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, role, id: userId } = session.user;
    const saleId = id;

    // Validate user permissions
    const permissionCheck = BusinessValidator.validateUserPermission(
      role,
      'DELETE_SALE'
    );
    if (!permissionCheck.isValid) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check if sale exists and belongs to tenant
    const existingSale = await prisma.sale.findFirst({
      where: { id: saleId, tenantId },
      include: {
        driver: { select: { name: true } },
        product: { select: { name: true, size: true } },
      },
    });

    if (!existingSale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    // Only allow deleting today's sales
    const saleDate = new Date(existingSale.saleDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    saleDate.setHours(0, 0, 0, 0);

    if (saleDate.getTime() !== today.getTime()) {
      return NextResponse.json(
        {
          error: "Can only delete today's sales",
        },
        { status: 400 }
      );
    }

    // Delete sale in transaction
    await prisma.$transaction(async (tx) => {
      // Delete the sale
      await tx.sale.delete({
        where: { id: saleId },
      });

      // Record the deletion in audit log
      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          action: 'DELETE',
          entityType: 'Sale',
          entityId: saleId,
          oldValues: JSON.stringify(existingSale),
          metadata: { reason: 'Sale deletion', deletedBy: userId },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Sale deleted successfully',
      deletedSale: {
        id: existingSale.id,
        driver: existingSale.driver.name,
        product: existingSale.product.name,
        quantity: existingSale.quantity,
        netValue: existingSale.netValue,
      },
    });
  } catch (error) {
    console.error('Sale deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
