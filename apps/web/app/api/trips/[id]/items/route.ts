import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { getCurrentUser } from '@/app/_lib/auth';
import { mapTripItem } from '@/app/_lib/mappers';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { members: true },
    });
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Check access: owner or accepted member
    const hasAccess =
      trip.userId === user.id ||
      trip.members.some(m => m.userId === user.id && m.acceptedAt);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const items = await prisma.tripItem.findMany({
      where: { tripId: id },
      orderBy: { startDateTime: 'asc' },
    });
    return NextResponse.json(items.map(mapTripItem));
  } catch (err) {
    console.error('GET /api/trips/[id]/items error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
