'use client';

import dynamic from 'next/dynamic';
import type { MapPin } from '@travel/ui';

const MapPreview = dynamic(
  () => import('@travel/ui').then((mod) => mod.MapPreview),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-zinc-400">Loading map...</div> }
);

interface MapClientProps {
  pins: MapPin[];
  tileUrl?: string;
}

export function MapClient({ pins, tileUrl }: MapClientProps) {
  return <MapPreview pins={pins} height="100%" zoom={5} tileUrl={tileUrl} />;
}
