import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';

export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId: authUser.id },
    });

    if (!settings) {
      // Return defaults if no settings exist
      return NextResponse.json({
        emailNotifications: true,
        pushNotifications: false,
        tripReminders: true,
        priceAlerts: true,
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        connectedApps: [],
      });
    }

    return NextResponse.json({
      emailNotifications: settings.emailNotifications,
      pushNotifications: settings.pushNotifications,
      tripReminders: settings.tripReminders,
      priceAlerts: settings.priceAlerts,
      timezone: settings.timezone,
      dateFormat: settings.dateFormat,
      currency: settings.currency,
      connectedApps: settings.connectedApps ? JSON.parse(settings.connectedApps) : [],
    });
  } catch (error) {
    console.error('GET /api/user/settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate allowed fields
    const allowedFields = [
      'emailNotifications',
      'pushNotifications',
      'tripReminders',
      'priceAlerts',
      'timezone',
      'dateFormat',
      'currency',
      'connectedApps',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        if (field === 'connectedApps') {
          updateData[field] = JSON.stringify(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: authUser.id },
      update: updateData,
      create: {
        userId: authUser.id,
        ...updateData,
      },
    });

    return NextResponse.json({
      emailNotifications: settings.emailNotifications,
      pushNotifications: settings.pushNotifications,
      tripReminders: settings.tripReminders,
      priceAlerts: settings.priceAlerts,
      timezone: settings.timezone,
      dateFormat: settings.dateFormat,
      currency: settings.currency,
      connectedApps: settings.connectedApps ? JSON.parse(settings.connectedApps) : [],
    });
  } catch (error) {
    console.error('PATCH /api/user/settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
