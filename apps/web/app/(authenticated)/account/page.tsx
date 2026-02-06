import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';
import { formatDate } from '@/app/_lib/format';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch stats from Prisma
  const [tripCount, pointsAccountCount, friendCount, recentTrips] =
    await Promise.all([
      prisma.trip.count({
        where: {
          OR: [
            { userId: user.id },
            {
              members: {
                some: { userId: user.id, acceptedAt: { not: null } },
              },
            },
          ],
        },
      }),
      prisma.pointsAccount.count({
        where: { userId: user.id },
      }),
      prisma.friendship.count({
        where: {
          OR: [
            { userId: user.id, status: 'accepted' },
            { friendId: user.id, status: 'accepted' },
          ],
        },
      }),
      prisma.trip.findMany({
        where: {
          OR: [
            { userId: user.id },
            {
              members: {
                some: { userId: user.id, acceptedAt: { not: null } },
              },
            },
          ],
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          items: {
            orderBy: { updatedAt: 'desc' },
            take: 3,
          },
        },
      }),
    ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Dashboard</h1>

      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        Welcome back, {user.name || user.email}!
      </p>

      {/* Stats Grid */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 text-2xl">&#9992;</div>
          <p className="text-3xl font-bold">{tripCount}</p>
          <p className="text-sm text-zinc-500">Trips</p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 text-2xl">&#11088;</div>
          <p className="text-3xl font-bold">{pointsAccountCount}</p>
          <p className="text-sm text-zinc-500">Points Programs</p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 text-2xl">&#128101;</div>
          <p className="text-3xl font-bold">{friendCount}</p>
          <p className="text-sm text-zinc-500">Friends</p>
        </div>
      </div>

      {/* Quick Links */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">Quick Links</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            href="/trips"
            className="flex flex-col items-center gap-2 rounded-lg border border-zinc-200 bg-white p-4 text-center transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="text-xl">&#9992;</span>
            <span className="text-sm font-medium">Trips</span>
          </Link>
          <Link
            href="/points"
            className="flex flex-col items-center gap-2 rounded-lg border border-zinc-200 bg-white p-4 text-center transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="text-xl">&#11088;</span>
            <span className="text-sm font-medium">Points</span>
          </Link>
          <Link
            href="/friends"
            className="flex flex-col items-center gap-2 rounded-lg border border-zinc-200 bg-white p-4 text-center transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="text-xl">&#128101;</span>
            <span className="text-sm font-medium">Friends</span>
          </Link>
          <Link
            href="/documents"
            className="flex flex-col items-center gap-2 rounded-lg border border-zinc-200 bg-white p-4 text-center transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="text-xl">&#128196;</span>
            <span className="text-sm font-medium">Documents</span>
          </Link>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
        <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {recentTrips.length === 0 ? (
            <p className="py-12 text-center text-zinc-500">
              No recent activity.{' '}
              <Link href="/trips/new" className="underline hover:text-zinc-700 dark:hover:text-zinc-300">
                Plan your first trip
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentTrips.map((trip) => (
                <li key={trip.id}>
                  <Link
                    href={`/trips/${trip.id}`}
                    className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{trip.name}</p>
                      <p className="truncate text-sm text-zinc-500">
                        {trip.destination} &middot;{' '}
                        {formatDate(trip.startDate)} &ndash;{' '}
                        {formatDate(trip.endDate)}
                      </p>
                      {trip.items.length > 0 && (
                        <p className="mt-0.5 truncate text-xs text-zinc-400">
                          Latest: {trip.items[0].title}
                        </p>
                      )}
                    </div>
                    <span className="ml-3 shrink-0 text-xs text-zinc-400">
                      {trip.items.length} item{trip.items.length !== 1 ? 's' : ''}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* User Info */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Account</h2>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-4">
            {user.picture && (
              <img
                src={user.picture}
                alt={user.name || 'Profile'}
                className="h-12 w-12 rounded-full object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              {user.name && (
                <p className="truncate font-medium">{user.name}</p>
              )}
              <p className="truncate text-sm text-zinc-500">{user.email}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
