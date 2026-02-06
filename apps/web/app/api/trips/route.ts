import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { mapTrip } from '@/app/_lib/mappers';

export async function GET() {
  const trips = await prisma.trip.findMany({
    orderBy: { startDate: 'asc' },
  });
  return NextResponse.json(trips.map(mapTrip));
}
