'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface TripMember {
  id: string;
  role: string;
  invitedAt: string;
  acceptedAt: string | null;
  guestEmail: string | null;
  guestName: string | null;
  user?: {
    id: string;
    email: string;
    name: string | null;
    picture: string | null;
  };
}

interface TripData {
  id: string;
  name: string;
  destination: string;
  members?: TripMember[];
}

interface Friend {
  id: string;
  status: string;
  friend: {
    id: string;
    email: string;
    name: string | null;
    picture: string | null;
  };
}

function roleBadge(role: string): string {
  switch (role) {
    case 'owner':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    case 'editor':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'viewer':
      return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
    default:
      return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
  }
}

export default function ShareTripPage() {
  const params = useParams<{ id: string }>();
  const tripId = params.id;

  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<TripData | null>(null);
  const [members, setMembers] = useState<TripMember[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // Fetch trip data and friends list
  useEffect(() => {
    async function fetchData() {
      try {
        const [tripRes, friendsRes] = await Promise.all([
          fetch(`/api/trips/${tripId}`),
          fetch('/api/friends'),
        ]);

        if (!tripRes.ok) {
          const data = await tripRes.json().catch(() => ({}));
          throw new Error(data.error || `Failed to load trip (${tripRes.status})`);
        }

        const tripData = await tripRes.json();
        setTrip(tripData);
        setMembers(tripData.members || []);

        if (friendsRes.ok) {
          const friendsData = await friendsRes.json();
          setFriends(
            friendsData.filter((f: Friend) => f.status === 'accepted')
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trip');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tripId]);

  async function handleInvite(email: string, role: string) {
    setError(null);
    setInviteSuccess(null);
    setInviting(true);

    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addMember: { email, role },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to invite member (${res.status})`);
      }

      setInviteSuccess(`Invitation sent to ${email}`);
      setInviteEmail('');

      // Refresh trip data to get updated members
      const refreshRes = await fetch(`/api/trips/${tripId}`);
      if (refreshRes.ok) {
        const refreshedTrip = await refreshRes.json();
        setMembers(refreshedTrip.members || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  }

  function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inviteEmail.trim()) {
      handleInvite(inviteEmail.trim(), inviteRole);
    }
  }

  function handleQuickInvite(friendEmail: string) {
    handleInvite(friendEmail, inviteRole);
  }

  // Filter friends who are not already members
  const memberEmails = new Set(
    members
      .map((m) => m.user?.email || m.guestEmail)
      .filter(Boolean)
  );
  const availableFriends = friends.filter(
    (f) => !memberEmails.has(f.friend.email)
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Share Trip</h1>
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !trip) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Share Trip</h1>
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
        <Link
          href="/trips"
          className="text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Back to trips
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Share Trip</h1>
          {trip && (
            <p className="mt-1 text-sm text-zinc-500">
              {trip.name} &middot; {trip.destination}
            </p>
          )}
        </div>
        <Link
          href={`/trips/${tripId}`}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Back to trip
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {inviteSuccess && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
          {inviteSuccess}
        </div>
      )}

      {/* Current Members */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Members</h2>
        <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {members.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">No members yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {members.map((member) => (
                <li key={member.id} className="flex items-center gap-3 px-4 py-3">
                  {member.user?.picture ? (
                    <img
                      src={member.user.picture}
                      alt={member.user.name || member.user.email}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                      {(member.user?.name || member.user?.email || member.guestEmail || '?')
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {member.user?.name || member.guestName || member.user?.email || member.guestEmail}
                    </p>
                    {member.user?.name && (
                      <p className="truncate text-xs text-zinc-500">
                        {member.user.email}
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge(member.role)}`}
                  >
                    {member.role}
                  </span>
                  {!member.acceptedAt && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      pending
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Invite by Email */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Invite by Email</h2>
        <form onSubmit={handleInviteSubmit} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="inviteEmail" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Email address
              </label>
              <input
                id="inviteEmail"
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="friend@example.com"
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>
            <div className="sm:w-32">
              <label htmlFor="inviteRole" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Role
              </label>
              <select
                id="inviteRole"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <button
              type="submit"
              disabled={inviting}
              className="rounded-md bg-zinc-900 text-white px-4 py-2 text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {inviting ? 'Inviting...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </section>

      {/* Quick Invite from Friends */}
      {availableFriends.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Quick Invite from Friends</h2>
          <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {availableFriends.map((friend) => (
                <li
                  key={friend.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  {friend.friend.picture ? (
                    <img
                      src={friend.friend.picture}
                      alt={friend.friend.name || friend.friend.email}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                      {(friend.friend.name || friend.friend.email)
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {friend.friend.name || friend.friend.email}
                    </p>
                    {friend.friend.name && (
                      <p className="truncate text-xs text-zinc-500">
                        {friend.friend.email}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleQuickInvite(friend.friend.email)}
                    disabled={inviting}
                    className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Invite
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
