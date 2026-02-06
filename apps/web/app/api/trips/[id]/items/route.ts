import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { mapTripItem } from '@/app/_lib/mappers';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const items = await prisma.tripItem.findMany({
    where: { tripId: id },
    orderBy: { startDateTime: 'asc' },
  });
  return NextResponse.json(items.map(mapTripItem));
}
