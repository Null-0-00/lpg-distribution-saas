import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const deposits = await prisma.deposit.findMany({
      where: {
        tenantId: session.user.tenantId,
        depositDate: {
          gte: new Date(date),
          lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        depositDate: 'desc',
      },
    });

    return NextResponse.json(deposits);
  } catch (error) {
    console.error('Error fetching deposits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const { amount, description, particulars, depositDate } = body;

    if (!amount || !description || !particulars) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const deposit = await prisma.deposit.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        amount: parseFloat(amount),
        description,
        particulars,
        depositDate: depositDate ? new Date(depositDate) : new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(deposit);
  } catch (error) {
    console.error('Error creating deposit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
