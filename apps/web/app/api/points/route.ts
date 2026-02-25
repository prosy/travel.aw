import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';
import { encryptForDb, isEncryptionConfigured } from '@/app/_lib/encryption';

/** Encrypt an account number, returning ciphertext + IV + last4 */
function encryptAccountNumber(plain: string): {
  accountNumber: string;
  accountNumberIV: string;
  accountNumberLast4: string;
} {
  const enc = encryptForDb(plain);
  return {
    accountNumber: enc.encrypted,
    accountNumberIV: enc.iv,
    accountNumberLast4: plain.slice(-4),
  };
}

export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accounts = await prisma.pointsAccount.findMany({
      where: { userId: authUser.id },
      orderBy: { programName: 'asc' },
    });

    return NextResponse.json(
      accounts.map((account) => ({
        id: account.id,
        programType: account.programType,
        programName: account.programName,
        // Masked: show last4 only, never decrypted full number in list
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
      }))
    );
  } catch (error) {
    console.error('GET /api/points error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface ProgramInput {
  programType: string;
  programName: string;
  accountNumber?: string | null;
  membershipTier?: string | null;
  currentBalance?: number;
  pendingPoints?: number;
  expiringPoints?: number | null;
  expirationDate?: string | null;
  annualFee?: number | null;
  nextFeeDate?: string | null;
  notes?: string | null;
}

function mapAccountToResponse(account: {
  id: string;
  programType: string;
  programName: string;
  accountNumberLast4: string | null;
  membershipTier: string | null;
  currentBalance: number;
  pendingPoints: number;
  expiringPoints: number | null;
  expirationDate: Date | null;
  annualFee: number | null;
  nextFeeDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
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
  };
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Fail closed if encryption not configured and account numbers are provided
    const hasAccountNumber = body.programs
      ? body.programs.some((p: ProgramInput) => p.accountNumber)
      : !!body.accountNumber;

    if (hasAccountNumber && !isEncryptionConfigured()) {
      return NextResponse.json({ error: 'Encryption not configured' }, { status: 503 });
    }

    // Check if bulk import (array of programs)
    if (body.programs && Array.isArray(body.programs)) {
      const programs: ProgramInput[] = body.programs;

      // Validate all programs have required fields
      for (const p of programs) {
        if (!p.programType || !p.programName) {
          return NextResponse.json(
            { error: 'All programs must have programType and programName' },
            { status: 400 }
          );
        }
      }

      // Bulk create with encrypted account numbers
      const accounts = await prisma.$transaction(
        programs.map((p) => {
          const acctEnc = p.accountNumber ? encryptAccountNumber(p.accountNumber) : null;
          return prisma.pointsAccount.create({
            data: {
              userId: authUser.id,
              programType: p.programType,
              programName: p.programName,
              accountNumber: acctEnc?.accountNumber ?? null,
              accountNumberIV: acctEnc?.accountNumberIV ?? null,
              accountNumberLast4: acctEnc?.accountNumberLast4 ?? null,
              membershipTier: p.membershipTier ?? null,
              currentBalance: p.currentBalance ?? 0,
              pendingPoints: p.pendingPoints ?? 0,
              expiringPoints: p.expiringPoints ?? null,
              expirationDate: p.expirationDate ? new Date(p.expirationDate) : null,
              annualFee: p.annualFee ?? null,
              nextFeeDate: p.nextFeeDate ? new Date(p.nextFeeDate) : null,
              notes: p.notes ?? null,
            },
          });
        })
      );

      return NextResponse.json(
        { accounts: accounts.map(mapAccountToResponse), count: accounts.length },
        { status: 201 }
      );
    }

    // Single program creation (existing behavior)
    if (!body.programType || !body.programName) {
      return NextResponse.json(
        { error: 'programType and programName are required' },
        { status: 400 }
      );
    }

    const acctEnc = body.accountNumber ? encryptAccountNumber(body.accountNumber) : null;

    const account = await prisma.pointsAccount.create({
      data: {
        userId: authUser.id,
        programType: body.programType,
        programName: body.programName,
        accountNumber: acctEnc?.accountNumber ?? null,
        accountNumberIV: acctEnc?.accountNumberIV ?? null,
        accountNumberLast4: acctEnc?.accountNumberLast4 ?? null,
        membershipTier: body.membershipTier ?? null,
        currentBalance: body.currentBalance ?? 0,
        pendingPoints: body.pendingPoints ?? 0,
        expiringPoints: body.expiringPoints ?? null,
        expirationDate: body.expirationDate ? new Date(body.expirationDate) : null,
        annualFee: body.annualFee ?? null,
        nextFeeDate: body.nextFeeDate ? new Date(body.nextFeeDate) : null,
        notes: body.notes ?? null,
      },
    });

    return NextResponse.json(mapAccountToResponse(account), { status: 201 });
  } catch (error) {
    console.error('POST /api/points error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
