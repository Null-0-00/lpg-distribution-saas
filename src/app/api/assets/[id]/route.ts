// Individual Asset Management API
// Handle updating and deleting specific assets

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { UserRole, AssetCategory } from '@prisma/client';
import { z } from 'zod';

const updateAssetSchema = z.object({
  name: z.string().min(1, 'Asset name is required').optional(),
  category: z.nativeEnum(AssetCategory).optional(),
  subCategory: z.string().optional(),
  value: z.number().min(0, 'Asset value must be non-negative').optional(),
  description: z.string().optional(),
  purchaseDate: z
    .string()
    .transform((val) => (val ? new Date(val) : undefined))
    .optional(),
  depreciationRate: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: assetId } = await context.params;
    const tenantId = session.user.tenantId;

    const asset = await prisma.asset.findFirst({
      where: {
        id: assetId,
        tenantId,
      },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Calculate current value with depreciation
    let currentValue = asset.value;
    if (asset.depreciationRate && asset.purchaseDate) {
      const yearsOwned =
        (new Date().getTime() - asset.purchaseDate.getTime()) /
        (1000 * 60 * 60 * 24 * 365);
      const depreciationAmount =
        asset.value * (asset.depreciationRate / 100) * yearsOwned;
      currentValue = Math.max(0, asset.value - depreciationAmount);
    }

    return NextResponse.json({
      asset: {
        id: asset.id,
        name: asset.name,
        category: asset.category,
        subCategory: asset.subCategory,
        originalValue: asset.value,
        currentValue,
        description: asset.description,
        purchaseDate: asset.purchaseDate,
        depreciationRate: asset.depreciationRate,
        isActive: asset.isActive,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
      },
    });
  } catch (error) {
    console.error('Asset fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id: assetId } = await context.params;
    const tenantId = session.user.tenantId;
    const body = await request.json();
    const validatedData = updateAssetSchema.parse(body);

    // Verify asset exists and belongs to tenant
    const existingAsset = await prisma.asset.findFirst({
      where: {
        id: assetId,
        tenantId,
      },
    });

    if (!existingAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Update the asset
    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.category && { category: validatedData.category }),
        ...(validatedData.subCategory !== undefined && {
          subCategory: validatedData.subCategory,
        }),
        ...(validatedData.value !== undefined && {
          value: validatedData.value,
        }),
        ...(validatedData.description !== undefined && {
          description: validatedData.description,
        }),
        ...(validatedData.purchaseDate !== undefined && {
          purchaseDate: validatedData.purchaseDate,
        }),
        ...(validatedData.depreciationRate !== undefined && {
          depreciationRate: validatedData.depreciationRate,
        }),
        ...(validatedData.isActive !== undefined && {
          isActive: validatedData.isActive,
        }),
      },
    });

    // Calculate current value
    let currentValue = updatedAsset.value;
    if (updatedAsset.depreciationRate && updatedAsset.purchaseDate) {
      const yearsOwned =
        (new Date().getTime() - updatedAsset.purchaseDate.getTime()) /
        (1000 * 60 * 60 * 24 * 365);
      const depreciationAmount =
        updatedAsset.value * (updatedAsset.depreciationRate / 100) * yearsOwned;
      currentValue = Math.max(0, updatedAsset.value - depreciationAmount);
    }

    return NextResponse.json({
      success: true,
      asset: {
        id: updatedAsset.id,
        name: updatedAsset.name,
        category: updatedAsset.category,
        subCategory: updatedAsset.subCategory,
        originalValue: updatedAsset.value,
        currentValue,
        description: updatedAsset.description,
        purchaseDate: updatedAsset.purchaseDate,
        depreciationRate: updatedAsset.depreciationRate,
        isActive: updatedAsset.isActive,
        updatedAt: updatedAsset.updatedAt,
      },
    });
  } catch (error) {
    console.error('Asset update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id: assetId } = await context.params;
    const tenantId = session.user.tenantId;

    // Verify asset exists and belongs to tenant
    const existingAsset = await prisma.asset.findFirst({
      where: {
        id: assetId,
        tenantId,
      },
    });

    if (!existingAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    await prisma.asset.update({
      where: { id: assetId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    console.error('Asset deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
