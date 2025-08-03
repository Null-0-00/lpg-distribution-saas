// Customer Management API
// Complete CRUD operations for customers

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { CustomerType } from '@prisma/client';

const createCustomerSchema = z.object({
  areaId: z.string().cuid(),
  driverId: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .refine((val) => !val || /^c[a-z0-9]{24}$/.test(val), 'Invalid driver ID'),
  name: z.string().min(1).max(100),
  phone: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .refine(
      (val) => !val || /^(\+?88)?01[3-9]\d{8}$/.test(val),
      'Invalid Bangladesh phone number'
    ),
  alternatePhone: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .refine(
      (val) => !val || /^(\+?88)?01[3-9]\d{8}$/.test(val),
      'Invalid Bangladesh phone number'
    ),
  address: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  customerCode: z
    .string()
    .max(20)
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  customerType: z.nativeEnum(CustomerType).default(CustomerType.RETAIL),
  isActive: z.boolean().default(true),
  notes: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
});

const updateCustomerSchema = createCustomerSchema.partial();

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const areaId = searchParams.get('areaId');
    const driverId = searchParams.get('driverId');
    const customerType = searchParams.get('customerType');
    const search = searchParams.get('search');
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    const includeReceivables =
      searchParams.get('includeReceivables') === 'true';

    const where: any = {
      tenantId: session.user.tenantId,
    };

    if (activeOnly) {
      where.isActive = true;
    }

    if (areaId) {
      where.areaId = areaId;
    }

    if (driverId) {
      where.driverId = driverId;
    }

    if (customerType) {
      where.customerType = customerType;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { customerCode: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        area: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        customerReceivableRecords: includeReceivables
          ? {
              orderBy: { date: 'desc' },
              take: 1,
              select: {
                date: true,
                cashReceivables: true,
                cylinderReceivables: true,
                totalReceivables: true,
              },
            }
          : false,
        _count: {
          select: {
            sales: true,
            customerReceivableRecords: true,
          },
        },
      },
      orderBy: [{ area: { name: 'asc' } }, { name: 'asc' }],
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createCustomerSchema.parse(body);

    // Normalize phone numbers
    if (data.phone) {
      data.phone = normalizePhoneNumber(data.phone);
    }
    if (data.alternatePhone) {
      data.alternatePhone = normalizePhoneNumber(data.alternatePhone);
    }

    // Verify area belongs to tenant
    const area = await prisma.area.findFirst({
      where: { id: data.areaId, tenantId: session.user.tenantId },
    });

    if (!area) {
      return NextResponse.json({ error: 'Area not found' }, { status: 404 });
    }

    // Verify driver if provided
    let driverId = data.driverId;
    if (driverId) {
      // Verify provided driver belongs to tenant
      const driver = await prisma.driver.findFirst({
        where: { id: driverId, tenantId: session.user.tenantId },
      });

      if (!driver) {
        return NextResponse.json(
          { error: 'Driver not found' },
          { status: 404 }
        );
      }
    } else {
      // Set to undefined if not provided
      driverId = undefined;
    }

    // Generate customer code if not provided
    if (!data.customerCode) {
      const areaCode = area.code || area.name.substring(0, 2).toUpperCase();
      const customerCount = await prisma.customer.count({
        where: { tenantId: session.user.tenantId, areaId: data.areaId },
      });
      data.customerCode = `${areaCode}${String(customerCount + 1).padStart(3, '0')}`;
    }

    // Check for duplicate customer code or phone
    const duplicateCheck = await prisma.customer.findFirst({
      where: {
        tenantId: session.user.tenantId,
        OR: [
          { customerCode: data.customerCode },
          ...(data.phone ? [{ phone: data.phone }] : []),
        ],
      },
    });

    if (duplicateCheck) {
      return NextResponse.json(
        {
          error:
            duplicateCheck.customerCode === data.customerCode
              ? 'Customer code already exists'
              : 'Phone number already exists',
        },
        { status: 409 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        tenantId: session.user.tenantId,
        ...data,
        driverId,
      },
      include: {
        area: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('id');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = updateCustomerSchema.parse(body);

    // Normalize phone numbers
    if (data.phone) {
      data.phone = normalizePhoneNumber(data.phone);
    }
    if (data.alternatePhone) {
      data.alternatePhone = normalizePhoneNumber(data.alternatePhone);
    }

    // Verify customer belongs to tenant
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Verify area and driver if being updated
    if (data.areaId || (data.driverId && data.driverId.trim() !== '')) {
      const checks = [];

      if (data.areaId) {
        checks.push(
          prisma.area.findFirst({
            where: { id: data.areaId, tenantId: session.user.tenantId },
          })
        );
      }

      if (data.driverId && data.driverId.trim() !== '') {
        checks.push(
          prisma.driver.findFirst({
            where: { id: data.driverId, tenantId: session.user.tenantId },
          })
        );
      }

      const results = await Promise.all(checks);

      if (data.areaId && !results[0]) {
        return NextResponse.json({ error: 'Area not found' }, { status: 404 });
      }

      if (
        data.driverId &&
        data.driverId.trim() !== '' &&
        !results[data.areaId ? 1 : 0]
      ) {
        return NextResponse.json(
          { error: 'Driver not found' },
          { status: 404 }
        );
      }
    }

    // Check for duplicates if updating unique fields
    if (data.customerCode || data.phone) {
      const duplicateCheck = await prisma.customer.findFirst({
        where: {
          tenantId: session.user.tenantId,
          id: { not: customerId },
          OR: [
            ...(data.customerCode ? [{ customerCode: data.customerCode }] : []),
            ...(data.phone ? [{ phone: data.phone }] : []),
          ],
        },
      });

      if (duplicateCheck) {
        return NextResponse.json(
          { error: 'Customer code or phone number already exists' },
          { status: 409 }
        );
      }
    }

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        ...data,
        // Convert empty driverId to null
        ...(data.driverId !== undefined
          ? {
              driverId:
                data.driverId && data.driverId.trim() !== ''
                  ? data.driverId
                  : null,
            }
          : {}),
      },
      include: {
        area: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('id');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Check if customer has receivables or sales
    const [receivablesCount, salesCount] = await Promise.all([
      prisma.customerReceivableRecord.count({
        where: { customerId },
      }),
      prisma.sale.count({
        where: { customerId },
      }),
    ]);

    if (receivablesCount > 0 || salesCount > 0) {
      // Soft delete instead of hard delete
      const customer = await prisma.customer.update({
        where: {
          id: customerId,
          tenantId: session.user.tenantId,
        },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        message: 'Customer deactivated (has transaction history)',
        customer,
      });
    } else {
      // Hard delete if no transaction history
      await prisma.customer.delete({
        where: {
          id: customerId,
          tenantId: session.user.tenantId,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Customer deleted permanently',
      });
    }
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}

/**
 * Normalize Bangladesh phone number
 */
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Handle different formats
  if (digits.startsWith('88')) {
    return `+${digits}`;
  } else if (digits.startsWith('01')) {
    return `+88${digits}`;
  } else {
    return `+88${digits}`;
  }
}
