import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';
import { decryptJson, encryptJson, isEncryptionConfigured } from '@/app/_lib/encryption';

type RouteParams = { params: Promise<{ id: string }> };

interface SensitiveDocData {
  documentNumber: string | null;
  issueDate: string | null;
  holderName: string | null;
  notes: string | null;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isEncryptionConfigured()) {
      return NextResponse.json(
        { error: 'Encryption not configured' },
        { status: 503 }
      );
    }

    const { id } = await params;

    const document = await prisma.travelDoc.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (document.userId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Decrypt sensitive data
    let sensitiveData: SensitiveDocData = {
      documentNumber: null,
      issueDate: null,
      holderName: null,
      notes: null,
    };

    try {
      sensitiveData = decryptJson<SensitiveDocData>(
        document.encryptedData,
        document.encryptionIV
      );
    } catch (err) {
      console.error('Failed to decrypt document data:', err);
      return NextResponse.json(
        { error: 'Failed to decrypt document' },
        { status: 500 }
      );
    }

    return NextResponse.json({
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
      // Decrypted fields
      documentNumber: sensitiveData.documentNumber,
      issueDate: sensitiveData.issueDate,
      holderName: sensitiveData.holderName,
      notes: sensitiveData.notes,
    });
  } catch (error) {
    console.error('GET /api/documents/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isEncryptionConfigured()) {
      return NextResponse.json(
        { error: 'Encryption not configured' },
        { status: 503 }
      );
    }

    const { id } = await params;

    const existing = await prisma.travelDoc.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (existing.userId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Decrypt existing sensitive data
    let sensitiveData: SensitiveDocData;
    try {
      sensitiveData = decryptJson<SensitiveDocData>(
        existing.encryptedData,
        existing.encryptionIV
      );
    } catch {
      sensitiveData = {
        documentNumber: null,
        issueDate: null,
        holderName: null,
        notes: null,
      };
    }

    // Update sensitive data with new values
    if (body.documentNumber !== undefined) sensitiveData.documentNumber = body.documentNumber;
    if (body.issueDate !== undefined) sensitiveData.issueDate = body.issueDate;
    if (body.holderName !== undefined) sensitiveData.holderName = body.holderName;
    if (body.notes !== undefined) sensitiveData.notes = body.notes;

    // Re-encrypt
    const { encrypted, iv } = encryptJson(sensitiveData);

    const document = await prisma.travelDoc.update({
      where: { id },
      data: {
        type: body.type ?? existing.type,
        title: body.title ?? existing.title,
        encryptedData: encrypted,
        encryptionIV: iv,
        countryCode: body.countryCode !== undefined ? body.countryCode : existing.countryCode,
        expirationDate: body.expirationDate !== undefined
          ? body.expirationDate ? new Date(body.expirationDate) : null
          : existing.expirationDate,
        reminderDays: body.reminderDays ?? existing.reminderDays,
        hasAttachment: body.hasAttachment ?? existing.hasAttachment,
        attachmentType: body.attachmentType !== undefined ? body.attachmentType : existing.attachmentType,
      },
    });

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('PATCH /api/documents/[id] error:', error);
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

    const existing = await prisma.travelDoc.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (existing.userId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.travelDoc.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/documents/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
