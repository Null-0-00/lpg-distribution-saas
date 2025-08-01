import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { CylinderInventoryValidator } from '@/lib/services/cylinder-inventory-validator';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { cylinderSizeId, quantity, transactionType } = data;

    if (!cylinderSizeId || !quantity || !transactionType) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: cylinderSizeId, quantity, transactionType',
        },
        { status: 400 }
      );
    }

    if (!['BUY', 'SELL'].includes(transactionType)) {
      return NextResponse.json(
        { error: 'Transaction type must be BUY or SELL' },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    const tenantId = session.user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant access' }, { status: 403 });
    }

    // Only validate for SELL transactions (BUY always adds to inventory)
    if (transactionType === 'BUY') {
      return NextResponse.json({
        isValid: true,
        available: Infinity,
        message: 'Buy transactions always valid - adds to inventory',
      });
    }

    // Get cylinder size info
    const cylinderSize = await prisma.cylinderSize.findFirst({
      where: { id: cylinderSizeId, tenantId },
    });

    if (!cylinderSize) {
      return NextResponse.json(
        { error: 'Cylinder size not found' },
        { status: 404 }
      );
    }

    // Use the validator to check inventory
    const cylinderValidator = new CylinderInventoryValidator(prisma);

    if (!cylinderSize.size) {
      return NextResponse.json(
        { error: 'Cylinder size data is incomplete' },
        { status: 400 }
      );
    }

    const validation = await cylinderValidator.validateSingleCylinderType(
      tenantId,
      cylinderSize.size,
      quantity,
      'empty'
    );

    return NextResponse.json(validation);
  } catch (error) {
    console.error('Cylinder inventory validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate cylinder inventory' },
      { status: 500 }
    );
  }
}
