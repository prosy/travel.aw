import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';

export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get full user with settings
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        settings: true,
        _count: {
          select: {
            tripMemberships: true,
            pointsAccounts: true,
            friendships: { where: { status: 'accepted' } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      settings: user.settings
        ? {
            emailNotifications: user.settings.emailNotifications,
            pushNotifications: user.settings.pushNotifications,
            tripReminders: user.settings.tripReminders,
            priceAlerts: user.settings.priceAlerts,
            timezone: user.settings.timezone,
            dateFormat: user.settings.dateFormat,
            currency: user.settings.currency,
          }
        : null,
      stats: {
        trips: user._count.tripMemberships,
        pointsAccounts: user._count.pointsAccounts,
        friends: user._count.friendships,
      },
    });
  } catch (error) {
    console.error('GET /api/user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
