import { prisma } from '@/app/_lib/prisma';
import { mapTripItem } from '@/app/_lib/mappers';
import { MapClient } from './MapClient';
import type { MapPin } from '@travel/ui';

export default async function MapPage() {
  // Fetch all trip items with location data
  const items = await prisma.tripItem.findMany({
    where: {
      locationLat: { not: null },
      locationLng: { not: null },
    },
    orderBy: { startDateTime: 'asc' },
  });

  // Map to contract types and extract pins
  const pins: MapPin[] = items
    .map(mapTripItem)
    .filter((item) => item.location?.lat != null && item.location?.lng != null)
    .map((item) => ({
      lat: item.location!.lat!,
      lng: item.location!.lng!,
      label: item.title,
    }));

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h1 className="text-lg font-bold">Map</h1>
        <a href="/" className="text-sm text-zinc-500 hover:text-zinc-800">Back</a>
      </header>
      <main className="flex-1">
        <MapClient pins={pins} tileUrl={process.env.NEXT_PUBLIC_MAP_TILE_URL} />
      </main>
    </div>
  );
}
