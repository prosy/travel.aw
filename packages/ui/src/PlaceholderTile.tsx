import React from 'react';

/**
 * Deterministic hash → 0..N from a string.
 * Uses djb2 for speed and stability.
 */
function hashCode(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0; // unsigned 32-bit
}

const PALETTE = [
  '#4f46e5', // indigo
  '#0891b2', // cyan
  '#059669', // emerald
  '#d97706', // amber
  '#dc2626', // red
  '#7c3aed', // violet
  '#db2777', // pink
  '#2563eb', // blue
  '#ca8a04', // yellow
  '#0d9488', // teal
] as const;

/**
 * Extract a 1–2 letter monogram from a name.
 * "Tokyo Trip" → "TT", "flight" → "FL"
 */
function monogram(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '??';
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

export interface PlaceholderTileProps {
  name: string;
  size?: number;
  className?: string;
}

export function PlaceholderTile({ name, size = 48, className = '' }: PlaceholderTileProps) {
  const bg = PALETTE[hashCode(name) % PALETTE.length];
  const letters = monogram(name);

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        backgroundColor: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 600,
        fontSize: size * 0.38,
        userSelect: 'none',
        flexShrink: 0,
      }}
      aria-hidden
    >
      {letters}
    </div>
  );
}
