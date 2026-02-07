import Link from 'next/link';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';
import { redirect } from 'next/navigation';
import { FriendCard } from '@/app/_components/friends/FriendCard';
import type { User } from '@travel/contracts';
import FriendRequestsSection from './FriendRequestsSection';

export default async function FriendsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { userId: user.id },
        { friendId: user.id },
      ],
    },
    include: {
      user: true,
      friend: true,
    },
  });

  // Separate into accepted friends and pending incoming requests
  type FriendshipEntry = (typeof friendships)[number];
  const acceptedFriends = friendships
    .filter((f: FriendshipEntry) => f.status === 'accepted')
    .map((f: FriendshipEntry) => {
      const isInitiator = f.userId === user.id;
      const other = isInitiator ? f.friend : f.user;
      return {
        friendshipId: f.id,
        nickname: f.nickname,
        friend: {
          id: other.id,
          email: other.email,
          name: other.name,
          picture: other.picture,
          emailVerified: other.emailVerified,
          createdAt: other.createdAt.toISOString(),
          lastLoginAt: other.lastLoginAt?.toISOString() ?? null,
        } satisfies User,
      };
    });

  const pendingRequests = friendships
    .filter((f: FriendshipEntry) => f.status === 'pending' && f.friendId === user.id)
    .map((f: FriendshipEntry) => ({
      friendshipId: f.id,
      from: {
        id: f.user.id,
        email: f.user.email,
        name: f.user.name,
        picture: f.user.picture,
        emailVerified: f.user.emailVerified,
        createdAt: f.user.createdAt.toISOString(),
        lastLoginAt: f.user.lastLoginAt?.toISOString() ?? null,
      } satisfies User,
      requestedAt: f.createdAt.toISOString(),
    }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Friends</h1>
        <Link
          href="/friends/invites"
          className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Invite Friend
        </Link>
      </div>

      {/* Pending incoming requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">
            Pending Requests ({pendingRequests.length})
          </h2>
          <FriendRequestsSection requests={pendingRequests} />
        </div>
      )}

      {/* Accepted friends */}
      {acceptedFriends.length === 0 && pendingRequests.length === 0 ? (
        <div className="py-12 text-center">
          <p className="mb-6 text-zinc-500">
            No friends yet. Invite someone to start sharing trips!
          </p>
          <Link
            href="/friends/invites"
            className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Invite Friend
          </Link>
        </div>
      ) : (
        acceptedFriends.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold tracking-tight">
              My Friends ({acceptedFriends.length})
            </h2>
            <ul className="space-y-3">
              {acceptedFriends.map((entry: (typeof acceptedFriends)[number]) => (
                <li key={entry.friendshipId}>
                  <FriendCard
                    friend={entry.friend}
                    status="accepted"
                    nickname={entry.nickname}
                  />
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </div>
  );
}
