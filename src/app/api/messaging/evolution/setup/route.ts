import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { z } from 'zod';
import {
  setupEvolutionProvider,
  getEvolutionStatus,
  testEvolutionAPI,
} from '@/lib/messaging/setup-evolution';

const setupSchema = z.object({
  apiUrl: z.string().url('Invalid API URL'),
  apiKey: z.string().min(1, 'API Key is required'),
  instanceName: z.string().min(1, 'Instance name is required'),
  webhookUrl: z.string().url('Invalid webhook URL').optional(),
});

const testSchema = z.object({
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
});

/**
 * Setup Evolution API provider
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can setup messaging providers' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = setupSchema.parse(body);

    const result = await setupEvolutionProvider({
      tenantId: session.user.tenantId,
      ...data,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error setting up Evolution API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get Evolution API status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = await getEvolutionStatus(session.user.tenantId);
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting Evolution status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Test Evolution API
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can test messaging providers' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { phoneNumber } = testSchema.parse(body);

    const result = await testEvolutionAPI(session.user.tenantId, phoneNumber);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error testing Evolution API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
