import { redirect } from 'next/navigation';
import { auth0 } from '@/app/_lib/auth0';
import { Sidebar } from '@/app/_components/layout/Sidebar';
import { TopNav } from '@/app/_components/layout/TopNav';
import { MobileNav } from '@/app/_components/layout/MobileNav';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const userData = {
    name: session.user.name ?? null,
    picture: session.user.picture ?? null,
    email: session.user.email ?? '',
  };

  return (
    <div className="flex h-screen">
      <Sidebar user={userData} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav user={userData} />
        <MobileNav />
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
