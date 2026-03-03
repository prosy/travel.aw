import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { getCurrentUser } from '@/app/_lib/auth';
import { mapTripItem } from '@/app/_lib/mappers';

type Params = { params: Promise<{ id: string; itemId: string }> };

async function verifyAccess(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { members: true },
  });
  if (!trip) return null;

  const hasAccess =
    trip.userId === userId ||
    trip.members.some(m => m.userId === userId && m.acceptedAt);

  return hasAccess ? trip : null;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, itemId } = await params;
    const trip = await verifyAccess(id, user.id);
    if (!trip) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const item = await prisma.tripItem.findFirst({
      where: { id: itemId, tripId: id },
    });
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(mapTripItem(item));
  } catch (err) {
    console.error('GET /api/trips/[id]/items/[itemId] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, itemId } = await params;
    const trip = await verifyAccess(id, user.id);
    if (!trip) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const item = await prisma.tripItem.findFirst({
      where: { id: itemId, tripId: id },
    });
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await prisma.tripItem.delete({ where: { id: itemId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/trips/[id]/items/[itemId] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
