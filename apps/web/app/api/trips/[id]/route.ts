import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { mapTrip } from '@/app/_lib/mappers';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { items: { orderBy: { startDateTime: 'asc' } } },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json(mapTrip(trip));
  } catch (err) {
    console.error('GET /api/trips/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
