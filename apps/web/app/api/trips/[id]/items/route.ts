import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { mapTripItem } from '@/app/_lib/mappers';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
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
