import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { mapTrip } from '@/app/_lib/mappers';

export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      orderBy: { startDate: 'asc' },
    });
    return NextResponse.json(trips.map(mapTrip));
  } catch (err) {
    console.error('GET /api/trips error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
