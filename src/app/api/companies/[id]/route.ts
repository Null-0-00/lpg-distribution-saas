import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/database/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized - Tenant required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    console.log('GET request - Company ID:', id, 'Tenant ID:', session.user.tenantId);
    const company = await prisma.company.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId
      },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        tenantId: true,
        products: {
          select: {
            id: true,
            name: true,
            size: true,
            currentPrice: true,
            lowStockThreshold: true,
            isActive: true
          },
          orderBy: { name: 'asc' }
        }
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      company
    });

  } catch (error) {
    console.error('Get company error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized - Tenant required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const data = await request.json();
    const { name, code, address, phone, email, isActive } = data;

    if (!name) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Check if company exists and belongs to tenant
    const existingCompany = await prisma.company.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId
      }
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if another company with same name exists (excluding current)
    const duplicateCompany = await prisma.company.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        id: { not: id }
      }
    });

    if (duplicateCompany) {
      return NextResponse.json(
        { error: 'Company with this name already exists' },
        { status: 409 }
      );
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        name,
        code,
        address,
        phone,
        email,
        isActive
      },
      include: {
        products: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            size: true,
            currentPrice: true,
            lowStockThreshold: true,
            isActive: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      company,
      message: 'Company updated successfully'
    });

  } catch (error) {
    console.error('Update company error:', error);
    return NextResponse.json(
      { error: 'Failed to update company' },
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
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized - Tenant required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    // Check if company exists and belongs to tenant
    const existingCompany = await prisma.company.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId
      },
      include: {
        products: true,
        shipments: true,
        purchases: true
      }
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if company has related data
    if (existingCompany.shipments.length > 0 || existingCompany.purchases.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete company with existing shipments or purchases. Deactivate instead.' },
        { status: 400 }
      );
    }

    // Delete products first, then company
    await prisma.$transaction([
      prisma.product.deleteMany({
        where: { companyId: id }
      }),
      prisma.company.delete({
        where: { id }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Company and all associated products deleted successfully'
    });

  } catch (error) {
    console.error('Delete company error:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}
