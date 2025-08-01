import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { validateTenantAccess } from '@/lib/auth/tenant-guard';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const tenantId = validateTenantAccess(session);

    const cylinderSizes = await prisma.cylinderSize.findMany({
      where: { tenantId },
      orderBy: { size: 'asc' },
    });

    return NextResponse.json({ cylinderSizes });
  } catch (error) {
    console.error('Get cylinder sizes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cylinder sizes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const tenantId = validateTenantAccess(session);
    const data = await request.json();
    const { size, description } = data;

    if (!size) {
      return NextResponse.json(
        { error: 'Missing required field: size' },
        { status: 400 }
      );
    }

    // Check if size already exists for this tenant
    const existingSize = await prisma.cylinderSize.findFirst({
      where: {
        size: { equals: size, mode: 'insensitive' },
        tenantId,
      },
    });

    if (existingSize) {
      return NextResponse.json(
        { error: 'Cylinder size already exists' },
        { status: 409 }
      );
    }

    const cylinderSize = await prisma.cylinderSize.create({
      data: {
        tenantId,
        size: size.trim(),
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({
      cylinderSize,
      message: 'Cylinder size created successfully',
    });
  } catch (error) {
    console.error('Create cylinder size error:', error);
    return NextResponse.json(
      { error: 'Failed to create cylinder size' },
      { status: 500 }
    );
  }
}
