import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';
import { encryptJson, isEncryptionConfigured } from '@/app/_lib/encryption';

export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documents = await prisma.travelDoc.findMany({
      where: { userId: authUser.id },
      orderBy: { updatedAt: 'desc' },
    });

    // Return metadata only (no decryption)
    return NextResponse.json(
      documents.map((doc) => ({
        id: doc.id,
        type: doc.type,
        title: doc.title,
        countryCode: doc.countryCode,
        expirationDate: doc.expirationDate?.toISOString() ?? null,
        reminderDays: doc.reminderDays,
        hasAttachment: doc.hasAttachment,
        attachmentType: doc.attachmentType,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('GET /api/documents error:', error);
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
      return NextResponse.json(
        { error: 'Encryption not configured. Set ENCRYPTION_KEY environment variable.' },
        { status: 503 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.type || !body.title) {
      return NextResponse.json(
        { error: 'type and title are required' },
        { status: 400 }
      );
    }

    // Extract sensitive data to encrypt
    const sensitiveData = {
      documentNumber: body.documentNumber ?? null,
      issueDate: body.issueDate ?? null,
      holderName: body.holderName ?? null,
      notes: body.notes ?? null,
      // Add any other sensitive fields here
    };

    const { encrypted, iv } = encryptJson(sensitiveData);

    const document = await prisma.travelDoc.create({
      data: {
        userId: authUser.id,
        type: body.type,
        title: body.title,
        encryptedData: encrypted,
        encryptionIV: iv,
        countryCode: body.countryCode ?? null,
        expirationDate: body.expirationDate ? new Date(body.expirationDate) : null,
        reminderDays: body.reminderDays ?? 90,
        hasAttachment: body.hasAttachment ?? false,
        attachmentType: body.attachmentType ?? null,
      },
    });

    return NextResponse.json(
      {
        id: document.id,
        type: document.type,
        title: document.title,
        countryCode: document.countryCode,
        expirationDate: document.expirationDate?.toISOString() ?? null,
        reminderDays: document.reminderDays,
        hasAttachment: document.hasAttachment,
        attachmentType: document.attachmentType,
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/documents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
