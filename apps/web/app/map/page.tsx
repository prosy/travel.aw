import { MapClient } from './MapClient';

export default function MapPage() {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h1 className="text-lg font-bold">Map</h1>
        <a href="/" className="text-sm text-zinc-500 hover:text-zinc-800">Back</a>
      </header>
      <main className="flex-1">
        <MapClient tileUrl={process.env.NEXT_PUBLIC_MAP_TILE_URL} />
      </main>
    </div>
  );
}
