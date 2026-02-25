import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { mapMedia } from '@/app/_lib/mappers';

// PUBLIC: CachedMedia is a shared cache (Wikipedia images, etc.) with no user-scoped data.
// Auth not required. Excluded from middleware matcher in B6.
export async function GET() {
  try {
    const media = await prisma.cachedMedia.findMany({
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { cachedAt: 'desc' },
    });
    return NextResponse.json(media.map(mapMedia));
  } catch (err) {
    console.error('GET /api/media error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
