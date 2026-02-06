'use client';

import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';

const DEFAULT_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export interface MapPin {
  lat: number;
  lng: number;
  label?: string;
}

export interface MapPreviewProps {
  pins: MapPin[];
  tileUrl?: string;
  height?: number | string;
  zoom?: number;
  className?: string;
}

function getCenter(pins: MapPin[]): LatLngExpression {
  if (pins.length === 0) return [0, 0];
  const avgLat = pins.reduce((s, p) => s + p.lat, 0) / pins.length;
  const avgLng = pins.reduce((s, p) => s + p.lng, 0) / pins.length;
  return [avgLat, avgLng];
}

export function MapPreview({
  pins,
  tileUrl,
  height = 300,
  zoom = 12,
  className = '',
}: MapPreviewProps) {
  const tile = tileUrl || DEFAULT_TILE_URL;
  const center = useMemo(() => getCenter(pins), [pins]);

  return (
    <div className={className} style={{ height, width: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', borderRadius: 8 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={tile}
        />
        {pins.map((pin, i) => (
          <Marker key={`${pin.lat}-${pin.lng}-${i}`} position={[pin.lat, pin.lng]}>
            {pin.label && <Popup>{pin.label}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
