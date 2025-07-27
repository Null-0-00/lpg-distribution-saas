import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }

    // Find user by email (search across all tenants for debug purposes)
    const user = await prisma.user.findFirst({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = user.id;

    // Reset the user's onboarding status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingCompleted: false,
        onboardingCompletedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding status reset successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        onboardingCompleted: updatedUser.onboardingCompleted,
        onboardingCompletedAt: updatedUser.onboardingCompletedAt,
      },
    });
  } catch (error) {
    console.error('Error resetting onboarding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
