'use client';

import dynamic from 'next/dynamic';

const MapPreview = dynamic(
  () => import('@travel/ui').then((mod) => mod.MapPreview),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-zinc-400">Loading map...</div> }
);

// TODO: Replace with real pins from trip data / API
const SAMPLE_PINS = [
  { lat: 35.6762, lng: 139.6503, label: 'Tokyo' },
  { lat: 35.6586, lng: 139.7454, label: 'Tokyo Tower' },
  { lat: 35.7148, lng: 139.7967, label: 'Senso-ji Temple' },
];

export function MapClient({ tileUrl }: { tileUrl?: string }) {
  return <MapPreview pins={SAMPLE_PINS} height="100%" zoom={13} tileUrl={tileUrl} />;
}
