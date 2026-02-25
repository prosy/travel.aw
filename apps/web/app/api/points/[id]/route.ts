import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';
import { encryptForDb, decryptFromDb, isEncryptionConfigured } from '@/app/_lib/encryption';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isEncryptionConfigured()) {
      return NextResponse.json({ error: 'Encryption not configured' }, { status: 503 });
    }

    const { id } = await params;

    const account = await prisma.pointsAccount.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { transactionDate: 'desc' },
          take: 50,
        },
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (account.userId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Decrypt full account number for single-resource view (owner only)
    const decryptedAccountNumber = account.accountNumber && account.accountNumberIV
      ? decryptFromDb(account.accountNumber, account.accountNumberIV)
      : account.accountNumber; // backwards compat: raw if no IV yet

    return NextResponse.json({
      id: account.id,
      programType: account.programType,
      programName: account.programName,
      accountNumber: decryptedAccountNumber,
      membershipTier: account.membershipTier,
      currentBalance: account.currentBalance,
      pendingPoints: account.pendingPoints,
      expiringPoints: account.expiringPoints,
      expirationDate: account.expirationDate?.toISOString() ?? null,
      annualFee: account.annualFee,
      nextFeeDate: account.nextFeeDate?.toISOString() ?? null,
      notes: account.notes,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
      transactions: account.transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        transactionDate: t.transactionDate.toISOString(),
        tripItemId: t.tripItemId,
        createdAt: t.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('GET /api/points/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.pointsAccount.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (existing.userId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Encrypt updated account number if provided
    let acctFields: {
      accountNumber?: string | null;
      accountNumberIV?: string | null;
      accountNumberLast4?: string | null;
    } = {};

    if (body.accountNumber !== undefined) {
      if (body.accountNumber && !isEncryptionConfigured()) {
        return NextResponse.json({ error: 'Encryption not configured' }, { status: 503 });
      }
      if (body.accountNumber) {
        const enc = encryptForDb(body.accountNumber);
        acctFields = {
          accountNumber: enc.encrypted,
          accountNumberIV: enc.iv,
          accountNumberLast4: body.accountNumber.slice(-4),
        };
      } else {
        acctFields = {
          accountNumber: null,
          accountNumberIV: null,
          accountNumberLast4: null,
        };
      }
    }

    const account = await prisma.pointsAccount.update({
      where: { id },
      data: {
        programType: body.programType ?? existing.programType,
        programName: body.programName ?? existing.programName,
        ...acctFields,
        membershipTier: body.membershipTier !== undefined ? body.membershipTier : existing.membershipTier,
        currentBalance: body.currentBalance ?? existing.currentBalance,
        pendingPoints: body.pendingPoints ?? existing.pendingPoints,
        expiringPoints: body.expiringPoints !== undefined ? body.expiringPoints : existing.expiringPoints,
        expirationDate: body.expirationDate !== undefined
          ? body.expirationDate ? new Date(body.expirationDate) : null
          : existing.expirationDate,
        annualFee: body.annualFee !== undefined ? body.annualFee : existing.annualFee,
        nextFeeDate: body.nextFeeDate !== undefined
          ? body.nextFeeDate ? new Date(body.nextFeeDate) : null
          : existing.nextFeeDate,
        notes: body.notes !== undefined ? body.notes : existing.notes,
      },
    });

    // Return masked in PATCH response (consistent with list view)
    return NextResponse.json({
      id: account.id,
      programType: account.programType,
      programName: account.programName,
      accountNumber: account.accountNumberLast4
        ? `••••${account.accountNumberLast4}`
        : null,
      membershipTier: account.membershipTier,
      currentBalance: account.currentBalance,
      pendingPoints: account.pendingPoints,
      expiringPoints: account.expiringPoints,
      expirationDate: account.expirationDate?.toISOString() ?? null,
      annualFee: account.annualFee,
      nextFeeDate: account.nextFeeDate?.toISOString() ?? null,
      notes: account.notes,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('PATCH /api/points/[id] error:', error);
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

    // Verify ownership
    const existing = await prisma.pointsAccount.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (existing.userId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.pointsAccount.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/points/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
