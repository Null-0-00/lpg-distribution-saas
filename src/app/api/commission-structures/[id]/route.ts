import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Verify the commission structure belongs to the tenant
    const commissionStructure = await prisma.commissionStructure.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!commissionStructure) {
      return NextResponse.json(
        { error: 'Commission structure not found' },
        { status: 404 }
      );
    }

    // Delete the commission structure
    await prisma.commissionStructure.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Commission structure deleted successfully',
    });
  } catch (error) {
    console.error('Commission structure deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete commission structure' },
      { status: 500 }
    );
  }
}
