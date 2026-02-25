import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';
import { encryptForDb, decryptFromDb, isEncryptionConfigured } from '@/app/_lib/encryption';

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isEncryptionConfigured()) {
      return NextResponse.json({ error: 'Encryption not configured' }, { status: 503 });
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

    // Encrypt updated PII fields with new IVs
    const phoneEnc = body.phone ? encryptForDb(body.phone) : null;
    const emailEnc = body.email !== undefined
      ? (body.email ? encryptForDb(body.email) : null)
      : undefined; // undefined means "not being updated"

    const contact = await prisma.emergencyContact.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        relationship: body.relationship ?? existing.relationship,
        phone: phoneEnc?.encrypted ?? existing.phone,
        phoneIV: phoneEnc?.iv ?? existing.phoneIV,
        ...(emailEnc !== undefined
          ? { email: emailEnc?.encrypted ?? null, emailIV: emailEnc?.iv ?? null }
          : {}),
        isPrimary: body.isPrimary ?? existing.isPrimary,
        notifyOnTripStart: body.notifyOnTripStart ?? existing.notifyOnTripStart,
        notifyOnDelay: body.notifyOnDelay ?? existing.notifyOnDelay,
      },
    });

    // Decrypt for response
    const decryptedPhone = contact.phoneIV
      ? decryptFromDb(contact.phone, contact.phoneIV)
      : contact.phone;
    const decryptedEmail = contact.email && contact.emailIV
      ? decryptFromDb(contact.email, contact.emailIV)
      : contact.email;

    return NextResponse.json({
      id: contact.id,
      name: contact.name,
      relationship: contact.relationship,
      phone: decryptedPhone,
      email: decryptedEmail,
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
