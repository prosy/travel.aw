import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';
import { encryptForDb, decryptFromDb, isEncryptionConfigured } from '@/app/_lib/encryption';

export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isEncryptionConfigured()) {
      return NextResponse.json({ error: 'Encryption not configured' }, { status: 503 });
    }

    const contacts = await prisma.emergencyContact.findMany({
      where: { userId: authUser.id },
      orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }],
    });

    return NextResponse.json(
      contacts.map((contact) => ({
        id: contact.id,
        name: contact.name,
        relationship: contact.relationship,
        phone: contact.phoneIV
          ? decryptFromDb(contact.phone, contact.phoneIV)
          : contact.phone, // backwards compat: raw if no IV yet
        email: contact.email && contact.emailIV
          ? decryptFromDb(contact.email, contact.emailIV)
          : contact.email,
        isPrimary: contact.isPrimary,
        notifyOnTripStart: contact.notifyOnTripStart,
        notifyOnDelay: contact.notifyOnDelay,
        createdAt: contact.createdAt.toISOString(),
        updatedAt: contact.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('GET /api/safety/contacts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isEncryptionConfigured()) {
      return NextResponse.json({ error: 'Encryption not configured' }, { status: 503 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.relationship || !body.phone) {
      return NextResponse.json(
        { error: 'name, relationship, and phone are required' },
        { status: 400 }
      );
    }

    // If setting as primary, unset other primary contacts
    if (body.isPrimary) {
      await prisma.emergencyContact.updateMany({
        where: { userId: authUser.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Encrypt PII fields
    const phoneEnc = encryptForDb(body.phone);
    const emailEnc = body.email ? encryptForDb(body.email) : null;

    const contact = await prisma.emergencyContact.create({
      data: {
        userId: authUser.id,
        name: body.name,
        relationship: body.relationship,
        phone: phoneEnc.encrypted,
        phoneIV: phoneEnc.iv,
        email: emailEnc?.encrypted ?? null,
        emailIV: emailEnc?.iv ?? null,
        isPrimary: body.isPrimary ?? false,
        notifyOnTripStart: body.notifyOnTripStart ?? false,
        notifyOnDelay: body.notifyOnDelay ?? false,
      },
    });

    return NextResponse.json(
      {
        id: contact.id,
        name: contact.name,
        relationship: contact.relationship,
        phone: body.phone, // return plaintext to the creating user
        email: body.email ?? null,
        isPrimary: contact.isPrimary,
        notifyOnTripStart: contact.notifyOnTripStart,
        notifyOnDelay: contact.notifyOnDelay,
        createdAt: contact.createdAt.toISOString(),
        updatedAt: contact.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/safety/contacts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
