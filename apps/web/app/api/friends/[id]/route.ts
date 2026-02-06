import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Find friendship
    const friendship = await prisma.friendship.findUnique({
      where: { id },
      include: { user: true, friend: true },
    });

    if (!friendship) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 });
    }

    // Check if user is part of this friendship
    const isInitiator = friendship.userId === authUser.id;
    const isRecipient = friendship.friendId === authUser.id;

    if (!isInitiator && !isRecipient) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Only recipient can accept/block pending requests
    if (body.status && (body.status === 'accepted' || body.status === 'blocked')) {
      if (friendship.status !== 'pending') {
        return NextResponse.json(
          { error: 'Can only accept/block pending requests' },
          { status: 400 }
        );
      }
      if (isInitiator) {
        return NextResponse.json(
          { error: 'Only recipient can accept/block requests' },
          { status: 403 }
        );
      }
    }

    const updated = await prisma.friendship.update({
      where: { id },
      data: {
        status: body.status ?? friendship.status,
        nickname: body.nickname !== undefined ? body.nickname : friendship.nickname,
      },
      include: { user: true, friend: true },
    });

    const otherUser = isInitiator ? updated.friend : updated.user;

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      nickname: updated.nickname,
      isInitiator,
      friend: {
        id: otherUser.id,
        email: otherUser.email,
        name: otherUser.name,
        picture: otherUser.picture,
      },
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('PATCH /api/friends/[id] error:', error);
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

    // Find friendship
    const friendship = await prisma.friendship.findUnique({
      where: { id },
    });

    if (!friendship) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 });
    }

    // Check if user is part of this friendship
    if (friendship.userId !== authUser.id && friendship.friendId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.friendship.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/friends/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
