import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';

    const where = {
      userId: authUser.id,
      ...(unreadOnly ? { isRead: false } : {}),
    };

    const alerts = await prisma.userAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(
      alerts.map((alert) => ({
        id: alert.id,
        tripId: alert.tripId,
        advisoryId: alert.advisoryId,
        alertType: alert.alertType,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        actionUrl: alert.actionUrl,
        isRead: alert.isRead,
        readAt: alert.readAt?.toISOString() ?? null,
        createdAt: alert.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('GET /api/safety/alerts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Mark alerts as read
    if (body.markRead && Array.isArray(body.alertIds)) {
      await prisma.userAlert.updateMany({
        where: {
          id: { in: body.alertIds },
          userId: authUser.id,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, markedRead: body.alertIds.length });
    }

    // Mark all as read
    if (body.markAllRead) {
      const result = await prisma.userAlert.updateMany({
        where: {
          userId: authUser.id,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, markedRead: result.count });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/safety/alerts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
