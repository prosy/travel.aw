import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth0 } from '@/app/_lib/auth0';

export default async function Home() {
  const session = await auth0.getSession();

  if (session) {
    redirect('/trips');
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
          travel.aw
        </span>
        <Link
          href="/auth/login"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          Sign In
        </Link>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          Plan, track, and share your trips
        </h1>
        <p className="mt-4 max-w-md text-lg text-zinc-500 dark:text-zinc-400">
          Organize flights, hotels, and activities in one place. Your next adventure starts here.
        </p>

        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/auth/login"
            className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Sign In
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 text-center text-xs text-zinc-400 dark:text-zinc-600">
        travel.aw
      </footer>
    </div>
  );
}
