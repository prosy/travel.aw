import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';

export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all friendships (both directions)
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: authUser.id },
          { friendId: authUser.id },
        ],
      },
      include: {
        user: true,
        friend: true,
      },
    });

    // Map to consistent format (always show the "other" user)
    const friends = friendships.map((f) => {
      const isInitiator = f.userId === authUser.id;
      const otherUser = isInitiator ? f.friend : f.user;
      return {
        id: f.id,
        status: f.status,
        nickname: f.nickname,
        isInitiator,
        friend: {
          id: otherUser.id,
          email: otherUser.email,
          name: otherUser.name,
          picture: otherUser.picture,
        },
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(friends);
  } catch (error) {
    console.error('GET /api/friends error:', error);
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

    if (!body.email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    // Find user by email
    const friendUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!friendUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (friendUser.id === authUser.id) {
      return NextResponse.json({ error: 'Cannot add yourself as a friend' }, { status: 400 });
    }

    // Check if friendship already exists (in either direction)
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: authUser.id, friendId: friendUser.id },
          { userId: friendUser.id, friendId: authUser.id },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Friendship already exists', status: existing.status },
        { status: 409 }
      );
    }

    // Create friend request
    const friendship = await prisma.friendship.create({
      data: {
        userId: authUser.id,
        friendId: friendUser.id,
        status: 'pending',
        nickname: body.nickname ?? null,
      },
      include: {
        friend: true,
      },
    });

    return NextResponse.json(
      {
        id: friendship.id,
        status: friendship.status,
        nickname: friendship.nickname,
        isInitiator: true,
        friend: {
          id: friendship.friend.id,
          email: friendship.friend.email,
          name: friendship.friend.name,
          picture: friendship.friend.picture,
        },
        createdAt: friendship.createdAt.toISOString(),
        updatedAt: friendship.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/friends error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
