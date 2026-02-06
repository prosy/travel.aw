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

export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
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

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/points error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
