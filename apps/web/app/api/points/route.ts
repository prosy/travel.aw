import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';

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

      // Bulk create
      const accounts = await prisma.$transaction(
        programs.map((p) =>
          prisma.pointsAccount.create({
            data: {
              userId: authUser.id,
              programType: p.programType,
              programName: p.programName,
              accountNumber: p.accountNumber ?? null,
              membershipTier: p.membershipTier ?? null,
              currentBalance: p.currentBalance ?? 0,
              pendingPoints: p.pendingPoints ?? 0,
              expiringPoints: p.expiringPoints ?? null,
              expirationDate: p.expirationDate ? new Date(p.expirationDate) : null,
              annualFee: p.annualFee ?? null,
              nextFeeDate: p.nextFeeDate ? new Date(p.nextFeeDate) : null,
              notes: p.notes ?? null,
            },
          })
        )
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

    const account = await prisma.pointsAccount.create({
      data: {
        userId: authUser.id,
        programType: body.programType,
        programName: body.programName,
        accountNumber: body.accountNumber ?? null,
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
