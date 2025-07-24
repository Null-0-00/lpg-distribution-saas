import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = session.user;

    // Get all products with company info
    const products = await prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      include: {
        company: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ company: { name: 'asc' } }, { size: 'asc' }],
    });

    // Get all inventory movements
    const movements = await prisma.inventoryMovement.findMany({
      where: {
        tenantId,
      },
      select: {
        productId: true,
        type: true,
        quantity: true,
      },
    });

    // Calculate inventory levels per product
    const inventoryLevels = products.map((product) => {
      const productMovements = movements.filter(
        (m) => m.productId === product.id
      );

      let fullCylinders = 0;
      let emptyCylinders = 0;

      productMovements.forEach((movement) => {
        switch (movement.type) {
          case 'PURCHASE_PACKAGE':
            fullCylinders += movement.quantity;
            break;
          case 'PURCHASE_REFILL':
            fullCylinders += movement.quantity;
            break;
          case 'SALE_PACKAGE':
            fullCylinders -= movement.quantity;
            break;
          case 'SALE_REFILL':
            fullCylinders -= movement.quantity;
            emptyCylinders += movement.quantity; // Refill sales create empty cylinders
            break;
          case 'EMPTY_CYLINDER_BUY':
            emptyCylinders += movement.quantity;
            break;
          case 'EMPTY_CYLINDER_SELL':
            emptyCylinders -= movement.quantity;
            break;
          default:
            break;
        }
      });

      const result = {
        product_id: product.id,
        product_name: product.name,
        product_size: product.size,
        company_name: product.company.name,
        full_cylinders: Math.max(0, fullCylinders),
        empty_cylinders: Math.max(0, emptyCylinders),
      };

      return result;
    });

    // Get cylinder receivables by getting all outstanding customer receivables of type CYLINDER
    const cylinderReceivablesRecords = await prisma.customerReceivable.findMany(
      {
        where: {
          tenantId,
          receivableType: 'CYLINDER',
          status: {
            in: ['CURRENT', 'DUE_SOON', 'OVERDUE'],
          },
        },
        select: {
          quantity: true,
        },
      }
    );

    const totalCylinderReceivables = cylinderReceivablesRecords.reduce(
      (sum, record) => sum + (record.quantity || 0),
      0
    );

    // Group full cylinders by company
    const fullCylindersData = inventoryLevels
      .filter((item) => item.full_cylinders > 0)
      .reduce(
        (acc, item) => {
          const key = `${item.company_name}-${item.product_size}`;
          if (!acc[key]) {
            acc[key] = {
              company: item.company_name,
              size: item.product_size,
              quantity: 0,
            };
          }
          acc[key].quantity += item.full_cylinders;
          return acc;
        },
        {} as Record<
          string,
          { company: string; size: string; quantity: number }
        >
      );

    // Group empty cylinders by size
    const emptyCylindersData = inventoryLevels.reduce(
      (acc, item) => {
        const size = item.product_size;
        if (!acc[size]) {
          acc[size] = {
            size: size,
            emptyCylinders: 0,
            emptyCylindersInHand: 0,
          };
        }
        acc[size].emptyCylinders += item.empty_cylinders;
        return acc;
      },
      {} as Record<
        string,
        { size: string; emptyCylinders: number; emptyCylindersInHand: number }
      >
    );

    // Calculate empty cylinders in hand for each size
    // For simplicity, we'll distribute the total receivables proportionally by size
    const totalEmptyCylinders = Object.values(emptyCylindersData).reduce(
      (sum, item) => sum + item.emptyCylinders,
      0
    );

    Object.values(emptyCylindersData).forEach((item) => {
      if (totalEmptyCylinders > 0) {
        const proportionalReceivables = Math.round(
          (item.emptyCylinders / totalEmptyCylinders) * totalCylinderReceivables
        );
        item.emptyCylindersInHand = Math.max(
          0,
          item.emptyCylinders - proportionalReceivables
        );
      } else {
        item.emptyCylindersInHand = item.emptyCylinders;
      }
    });

    return NextResponse.json({
      success: true,
      fullCylinders: Object.values(fullCylindersData).sort((a, b) => {
        if (a.company !== b.company) return a.company.localeCompare(b.company);
        return a.size.localeCompare(b.size);
      }),
      emptyCylinders: Object.values(emptyCylindersData).sort((a, b) =>
        a.size.localeCompare(b.size)
      ),
      totalCylinderReceivables: totalCylinderReceivables,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cylinders summary fetch error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
