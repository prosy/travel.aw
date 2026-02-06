import Link from 'next/link';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';
import { redirect } from 'next/navigation';

export default async function SafetyCenterPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const [unreadAlertCount, contactCount, advisoryCount] = await Promise.all([
    prisma.userAlert.count({
      where: { userId: user.id, isRead: false },
    }),
    prisma.emergencyContact.count({
      where: { userId: user.id },
    }),
    prisma.travelAdvisory.count(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Safety Center</h1>

      {unreadAlertCount > 0 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              You have {unreadAlertCount} unread alert{unreadAlertCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/safety/contacts"
          className="rounded-lg border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="mb-2 text-lg font-semibold">Emergency Contacts</h2>
          <p className="text-sm text-zinc-500">
            {contactCount === 0
              ? 'No contacts added yet. Add your emergency contacts for quick access while traveling.'
              : `${contactCount} contact${contactCount !== 1 ? 's' : ''} saved`}
          </p>
        </Link>

        <Link
          href="/safety/advisories"
          className="rounded-lg border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mb-2 text-lg font-semibold">Travel Advisories</h2>
          <p className="text-sm text-zinc-500">
            {advisoryCount === 0
              ? 'No advisories available. Check back for safety information about your destinations.'
              : `${advisoryCount} advisor${advisoryCount !== 1 ? 'ies' : 'y'} available`}
          </p>
        </Link>
      </div>
    </div>
  );
}
