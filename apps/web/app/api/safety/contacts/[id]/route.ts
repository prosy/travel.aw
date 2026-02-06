import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.emergencyContact.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    if (existing.userId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // If setting as primary, unset other primary contacts
    if (body.isPrimary && !existing.isPrimary) {
      await prisma.emergencyContact.updateMany({
        where: { userId: authUser.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const contact = await prisma.emergencyContact.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        relationship: body.relationship ?? existing.relationship,
        phone: body.phone ?? existing.phone,
        email: body.email !== undefined ? body.email : existing.email,
        isPrimary: body.isPrimary ?? existing.isPrimary,
        notifyOnTripStart: body.notifyOnTripStart ?? existing.notifyOnTripStart,
        notifyOnDelay: body.notifyOnDelay ?? existing.notifyOnDelay,
      },
    });

    return NextResponse.json({
      id: contact.id,
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email,
      isPrimary: contact.isPrimary,
      notifyOnTripStart: contact.notifyOnTripStart,
      notifyOnDelay: contact.notifyOnDelay,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('PATCH /api/safety/contacts/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.emergencyContact.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    if (existing.userId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.emergencyContact.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/safety/contacts/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
