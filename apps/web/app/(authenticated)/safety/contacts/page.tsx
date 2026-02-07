import Link from 'next/link';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';
import { redirect } from 'next/navigation';
import { EmergencyContactCard } from '@/app/_components/safety/EmergencyContactCard';
import type { EmergencyContact } from '@travel/contracts';

export default async function EmergencyContactsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const rawContacts = await prisma.emergencyContact.findMany({
    where: { userId: user.id },
    orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }],
  });

  const contacts: EmergencyContact[] = rawContacts.map((contact: (typeof rawContacts)[number]) => ({
    id: contact.id,
    name: contact.name,
    relationship: contact.relationship,
    phone: contact.phone,
    email: contact.email,
    isPrimary: contact.isPrimary,
    notifyOnTripStart: contact.notifyOnTripStart,
    notifyOnDelay: contact.notifyOnDelay,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/safety"
            className="mb-2 block text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            &larr; Safety Center
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Emergency Contacts
          </h1>
        </div>
        <Link
          href="/safety/contacts/new"
          className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Add Contact
        </Link>
      </div>

      {contacts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="mb-6 text-zinc-500">No emergency contacts added.</p>
          <Link
            href="/safety/contacts/new"
            className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Add Contact
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {contacts.map((contact) => (
            <li key={contact.id}>
              <EmergencyContactCard contact={contact} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
