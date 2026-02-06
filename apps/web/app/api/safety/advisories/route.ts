import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get('country');

    const where = countryCode ? { countryCode } : {};

    const advisories = await prisma.travelAdvisory.findMany({
      where,
      orderBy: [{ advisoryLevel: 'desc' }, { lastUpdated: 'desc' }],
    });

    return NextResponse.json(
      advisories.map((advisory) => ({
        id: advisory.id,
        countryCode: advisory.countryCode,
        countryName: advisory.countryName,
        advisoryLevel: advisory.advisoryLevel,
        advisoryText: advisory.advisoryText,
        lastUpdated: advisory.lastUpdated.toISOString(),
        source: advisory.source,
        sourceUrl: advisory.sourceUrl,
        healthRisks: advisory.healthRisks ? JSON.parse(advisory.healthRisks) : null,
        securityRisks: advisory.securityRisks ? JSON.parse(advisory.securityRisks) : null,
        entryRequirements: advisory.entryRequirements ? JSON.parse(advisory.entryRequirements) : null,
      }))
    );
  } catch (error) {
    console.error('GET /api/safety/advisories error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
