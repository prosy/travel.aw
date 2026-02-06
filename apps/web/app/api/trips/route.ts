import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { mapTrip } from '@/app/_lib/mappers';
import { getCurrentUser } from '@/app/_lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    // If authenticated, return user's trips (owned or member of)
    // If not authenticated, return empty array (middleware should block, but defense in depth)
    if (!user) {
      return NextResponse.json([]);
    }

    const trips = await prisma.trip.findMany({
      where: {
        OR: [
          { userId: user.id },
          { members: { some: { userId: user.id, acceptedAt: { not: null } } } },
        ],
      },
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json(trips.map(mapTrip));
  } catch (err) {
    console.error('GET /api/trips error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.startDate || !body.endDate || !body.destination) {
      return NextResponse.json(
        { error: 'name, startDate, endDate, and destination are required' },
        { status: 400 }
      );
    }

    // Create trip with user ownership and auto-create owner membership
    const trip = await prisma.trip.create({
      data: {
        name: body.name,
        description: body.description ?? null,
        startDate: body.startDate,
        endDate: body.endDate,
        destination: body.destination,
        status: body.status ?? 'draft',
        userId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'owner',
            acceptedAt: new Date(),
          },
        },
      },
    });

    return NextResponse.json(mapTrip(trip), { status: 201 });
  } catch (err) {
    console.error('POST /api/trips error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
