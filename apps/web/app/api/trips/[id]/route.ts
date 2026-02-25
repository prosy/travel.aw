import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { mapTrip } from '@/app/_lib/mappers';
import { getCurrentUser } from '@/app/_lib/auth';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        items: { orderBy: { startDateTime: 'asc' } },
        members: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Orphan trips (userId=null) are not publicly readable — require a claim flow (out of scope)
    if (trip.userId === null) {
      return NextResponse.json(
        { error: 'This trip has no owner. Contact support to claim it.' },
        { status: 403 }
      );
    }

    // Check access: owner or accepted member
    const hasAccess =
      trip.userId === user.id ||
      trip.members.some(m => m.userId === user.id && m.acceptedAt);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(mapTrip(trip));
  } catch (err) {
    console.error('GET /api/trips/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.trip.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Check edit access: owner or editor member
    const canEdit =
      existing.userId === user.id ||
      existing.members.some(m => m.userId === user.id && m.acceptedAt && (m.role === 'owner' || m.role === 'editor'));

    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const trip = await prisma.trip.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        description: body.description !== undefined ? body.description : existing.description,
        startDate: body.startDate ?? existing.startDate,
        endDate: body.endDate ?? existing.endDate,
        destination: body.destination ?? existing.destination,
        status: body.status ?? existing.status,
      },
    });

    return NextResponse.json(mapTrip(trip));
  } catch (err) {
    console.error('PATCH /api/trips/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.trip.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Only owner can delete
    const isOwner =
      existing.userId === user.id ||
      existing.members.some(m => m.userId === user.id && m.role === 'owner');

    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.trip.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/trips/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
