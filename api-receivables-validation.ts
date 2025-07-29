// API Route: /api/receivables/validation
// This endpoint validates current receivables against immutable baseline

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const { searchParams } = new URL(request.url);

    // Optional filters
    const driverName = searchParams.get('driver');
    const includeAuditTrail = searchParams.get('includeAuditTrail') === 'true';
    const onlyDiscrepancies = searchParams.get('onlyDiscrepancies') === 'true';

    // 1. Get baseline data (immutable original values)
    const baselineData = await prisma.receivableRecord.findMany({
      where: {
        tenantId,
        ...(driverName && {
          driver: {
            name: {
              contains: driverName,
              mode: 'insensitive',
            },
          },
        }),
      },
      include: {
        driver: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: [
        { driver: { name: 'asc' } },
        { receivableType: 'asc' },
        { cylinderSize: 'asc' },
      ],
    });

    // 2. Get current working data (editable values)
    const currentData = await prisma.customerReceivable.findMany({
      where: {
        tenantId,
        status: 'CURRENT',
        ...(driverName && {
          driver: {
            name: {
              contains: driverName,
              mode: 'insensitive',
            },
          },
        }),
      },
      include: {
        driver: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: [
        { driver: { name: 'asc' } },
        { receivableType: 'asc' },
        { size: 'asc' },
      ],
    });

    // 3. Compare baseline vs current and identify discrepancies
    const validationResults = baselineData.map((baseline: any) => {
      // Find matching current record
      const currentRecord = currentData.find(
        (current) =>
          current.driverId === baseline.driverId &&
          current.receivableType === baseline.receivableType &&
          (baseline.receivableType === 'CASH' ||
            (baseline.receivableType === 'CYLINDER' &&
              current.size === baseline.cylinderSize))
      );

      const baselineValue =
        baseline.receivableType === 'CASH'
          ? baseline.cashAmount || 0
          : baseline.cylinderQuantity || 0;

      const currentValue = currentRecord
        ? baseline.receivableType === 'CASH'
          ? currentRecord.amount || 0
          : currentRecord.quantity || 0
        : 0;

      const difference = currentValue - baselineValue;
      const hasDiscrepancy = Math.abs(difference) > 0.01; // Account for floating point precision

      return {
        driverId: baseline.driverId,
        driverName: baseline.driver.name,
        driverPhone: baseline.driver.phone,
        receivableType: baseline.receivableType,
        cylinderSize: baseline.cylinderSize,

        // Baseline (original) values
        baselineValue,
        baselineCreatedAt: baseline.createdAt,
        baselineSource: baseline.source,

        // Current (working) values
        currentValue,
        currentRecordId: currentRecord?.id,
        currentUpdatedAt: currentRecord?.updatedAt,

        // Comparison
        difference,
        percentageChange:
          baselineValue > 0 ? (difference / baselineValue) * 100 : 0,
        hasDiscrepancy,
        status: hasDiscrepancy
          ? difference > 0
            ? 'INCREASED'
            : 'DECREASED'
          : 'UNCHANGED',

        // Metadata
        lastValidated: new Date().toISOString(),
      };
    });

    // 4. Filter results if only discrepancies requested
    const filteredResults = onlyDiscrepancies
      ? validationResults.filter((result: any) => result.hasDiscrepancy)
      : validationResults;

    // 5. Get audit trail if requested
    let auditTrail = [];
    if (includeAuditTrail) {
      const driverIds = filteredResults.map((r: any) => r.driverId);
      auditTrail = await prisma.auditLog.findMany({
        where: {
          tenantId,
          driverId: { in: driverIds },
        },
        include: {
          driver: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100, // Limit to recent 100 entries
      });
    }

    // 6. Calculate summary statistics
    const summary = {
      totalRecords: validationResults.length,
      recordsWithDiscrepancies: validationResults.filter(
        (r: any) => r.hasDiscrepancy
      ).length,
      totalBaselineCash: validationResults
        .filter((r: any) => r.receivableType === 'CASH')
        .reduce((sum: number, r: any) => sum + r.baselineValue, 0),
      totalCurrentCash: validationResults
        .filter((r: any) => r.receivableType === 'CASH')
        .reduce((sum: number, r: any) => sum + r.currentValue, 0),
      totalBaselineCylinders: validationResults
        .filter((r: any) => r.receivableType === 'CYLINDER')
        .reduce((sum: number, r: any) => sum + r.baselineValue, 0),
      totalCurrentCylinders: validationResults
        .filter((r: any) => r.receivableType === 'CYLINDER')
        .reduce((sum: number, r: any) => sum + r.currentValue, 0),
      validationAccuracy:
        validationResults.length > 0
          ? ((validationResults.length -
              validationResults.filter((r: any) => r.hasDiscrepancy).length) /
              validationResults.length) *
            100
          : 100,
    };

    // 7. Identify potential issues
    const issues = [];

    // Check for missing current records
    const missingRecords = validationResults.filter(
      (r: any) => r.currentValue === 0 && r.baselineValue > 0
    );
    if (missingRecords.length > 0) {
      issues.push({
        type: 'MISSING_RECORDS',
        count: missingRecords.length,
        description: 'Baseline records exist but no current records found',
        severity: 'HIGH',
      });
    }

    // Check for unauthorized changes (large discrepancies)
    const largeDiscrepancies = validationResults.filter(
      (r: any) => r.hasDiscrepancy && Math.abs(r.percentageChange) > 50
    );
    if (largeDiscrepancies.length > 0) {
      issues.push({
        type: 'LARGE_DISCREPANCIES',
        count: largeDiscrepancies.length,
        description: 'Records with >50% change from baseline',
        severity: 'MEDIUM',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        validationResults: filteredResults,
        auditTrail: auditTrail.map((audit: any) => ({
          id: audit.id,
          driverName: audit.driver.name,
          action: audit.action,
          entityType: audit.entityType,
          fieldChanged: audit.fieldChanged,
          oldValue: audit.oldValue,
          newValue: audit.newValue,
          changeReason: audit.changeReason,
          createdAt: audit.createdAt,
          createdBy: audit.createdBy,
        })),
        summary,
        issues,
      },
      meta: {
        totalRecords: filteredResults.length,
        filters: {
          driver: driverName,
          includeAuditTrail,
          onlyDiscrepancies,
        },
        validatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error validating receivables:', error);
    return NextResponse.json(
      { error: 'Failed to validate receivables data' },
      { status: 500 }
    );
  }
}

// POST endpoint to create a validation snapshot
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId || !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const userId = session.user.id;
    const body = await request.json();
    const { notes, snapshotType = 'ON_DEMAND' } = body;

    // Get current receivables data
    const currentReceivables = await prisma.customerReceivable.findMany({
      where: {
        tenantId,
        status: 'CURRENT',
      },
      include: {
        driver: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    // Group by driver
    const driverReceivables = currentReceivables.reduce(
      (acc, receivable) => {
        const driverId = receivable.driverId;
        if (!acc[driverId]) {
          acc[driverId] = {
            driverId,
            driverName: receivable.driver.name,
            driverPhone: receivable.driver.phone,
            cashReceivables: 0,
            cylinderReceivables: [],
            totalCylinders: 0,
          };
        }

        if (receivable.receivableType === 'CASH') {
          acc[driverId].cashReceivables += receivable.amount || 0;
        } else if (receivable.receivableType === 'CYLINDER') {
          acc[driverId].cylinderReceivables.push({
            size: receivable.size,
            quantity: receivable.quantity || 0,
          });
          acc[driverId].totalCylinders += receivable.quantity || 0;
        }

        return acc;
      },
      {} as Record<string, any>
    );

    const snapshotData = Object.values(driverReceivables);
    const totalCash = snapshotData.reduce(
      (sum: number, driver: any) => sum + driver.cashReceivables,
      0
    );
    const totalCylinders = snapshotData.reduce(
      (sum: number, driver: any) => sum + driver.totalCylinders,
      0
    );

    // Create snapshot
    const snapshot = await prisma.receivableRecord.create({
      data: {
        tenantId,
        snapshotDate: new Date(),
        snapshotType: snapshotType as any,
        driverReceivables: snapshotData,
        totalCashReceivables: totalCash,
        totalCylinderReceivables: totalCylinders,
        totalDrivers: snapshotData.length,
        createdBy: userId,
        notes: notes || 'Manual validation snapshot',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        snapshotId: snapshot.id,
        snapshotDate: snapshot.snapshotDate,
        totalDrivers: snapshot.totalDrivers,
        totalCashReceivables: snapshot.totalCashReceivables,
        totalCylinderReceivables: snapshot.totalCylinderReceivables,
      },
    });
  } catch (error) {
    console.error('Error creating validation snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to create validation snapshot' },
      { status: 500 }
    );
  }
}
