import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'email query parameter is required' }, { status: 400 });
    }

    // Find users by email (partial match)
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: email,
        },
        id: {
          not: authUser.id, // Exclude self
        },
      },
      take: 10,
    });

    // Get existing friendships to show status
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: authUser.id, friendId: { in: users.map((u) => u.id) } },
          { friendId: authUser.id, userId: { in: users.map((u) => u.id) } },
        ],
      },
    });

    const friendshipMap = new Map<string, string>();
    for (const f of friendships) {
      const otherId = f.userId === authUser.id ? f.friendId : f.userId;
      friendshipMap.set(otherId, f.status);
    }

    return NextResponse.json(
      users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        friendshipStatus: friendshipMap.get(user.id) ?? null,
      }))
    );
  } catch (error) {
    console.error('GET /api/friends/search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
