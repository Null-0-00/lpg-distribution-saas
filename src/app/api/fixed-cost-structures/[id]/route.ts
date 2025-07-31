import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify the fixed cost structure belongs to the tenant
    const fixedCostStructure = await prisma.fixedCostStructure.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!fixedCostStructure) {
      return NextResponse.json(
        { error: 'Fixed cost structure not found' },
        { status: 404 }
      );
    }

    // Delete the fixed cost structure
    await prisma.fixedCostStructure.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Fixed cost structure deleted successfully',
    });
  } catch (error) {
    console.error('Fixed cost structure deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete fixed cost structure' },
      { status: 500 }
    );
  }
}
