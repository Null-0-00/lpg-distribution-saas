import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const tenantId = session.user.tenantId;

    const where: any = { tenantId };
    if (driverId) where.driverId = driverId;

    // Get receivables changes log for retail drivers only
    console.log('Fetching changes for tenantId:', tenantId);

    // First, let's check if there are any audit logs at all for this tenant
    const totalAuditLogs = await prisma.auditLog.count({
      where: { tenantId },
    });
    console.log('Total audit logs for tenant:', totalAuditLogs);

    // Check specifically for CustomerReceivable logs
    const receivableAuditLogs = await prisma.auditLog.count({
      where: {
        tenantId,
        entityType: 'CustomerReceivable',
      },
    });
    console.log('CustomerReceivable audit logs:', receivableAuditLogs);

    const changes = await prisma.auditLog.findMany({
      where: {
        tenantId,
        entityType: 'CustomerReceivable',
        action: { in: ['CREATE', 'UPDATE', 'DELETE'] },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    console.log('Found changes:', changes.length);
    console.log('Sample change data:', changes[0]);

    const totalCount = await prisma.auditLog.count({
      where: {
        tenantId,
        entityType: 'CustomerReceivable',
        action: { in: ['CREATE', 'UPDATE', 'DELETE'] },
      },
    });

    // Process changes to extract meaningful information
    const processedChanges = changes.map((change) => {
      const metadata = change.metadata as any;
      const newValues = change.newValues as any;
      const oldValues = change.oldValues as any;

      // Get driver name from metadata
      const driverName = metadata?.driverName || 'Unknown Driver';

      // Determine receivable type and amount/quantity
      let receivableType = 'UNKNOWN';
      let amount = 0;
      let quantity = 0;
      let customerName = 'Unknown Customer';

      if (newValues) {
        receivableType = newValues.receivableType || 'UNKNOWN';
        amount = newValues.amount || 0;
        quantity = newValues.quantity || 0;
        customerName =
          newValues.customerName ||
          metadata?.customerName ||
          'Unknown Customer';
      } else if (oldValues) {
        receivableType = oldValues.receivableType || 'UNKNOWN';
        amount = oldValues.amount || 0;
        quantity = oldValues.quantity || 0;
        customerName =
          oldValues.customerName ||
          metadata?.customerName ||
          'Unknown Customer';
      }

      // For UPDATE actions, determine if it's a payment or cylinder return
      let actionDescription = change.action;
      if (change.action === 'UPDATE') {
        if (oldValues && newValues) {
          // Check metadata for payment/return indicators
          const isPayment = metadata?.paymentAmount !== undefined;
          const isReturn = metadata?.returnQuantity !== undefined;

          if (isPayment) {
            actionDescription = 'PAYMENT';
            amount = metadata.paymentAmount;
          } else if (isReturn) {
            actionDescription = 'RETURN';
            quantity = metadata.returnQuantity;
          } else if (
            oldValues.status !== newValues.status &&
            newValues.status === 'PAID'
          ) {
            actionDescription = 'PAID';
          } else if (oldValues.quantity > newValues.quantity) {
            actionDescription = 'RETURN';
          }
        }
      }

      return {
        timestamp: change.createdAt,
        action: actionDescription,
        driverName,
        customerName,
        receivableType,
        amount,
        quantity,
        userName: change.user?.name || 'Unknown User',
        entityId: change.entityId,
        metadata: metadata,
      };
    });

    console.log('Processed changes:', processedChanges);

    return NextResponse.json({
      changes: processedChanges,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching receivables changes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
