import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { mapMedia } from '@/app/_lib/mappers';

export async function GET() {
  const media = await prisma.cachedMedia.findMany({
    orderBy: { cachedAt: 'desc' },
  });
  return NextResponse.json(media.map(mapMedia));
}
