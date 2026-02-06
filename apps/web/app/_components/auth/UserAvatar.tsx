/**
 * Deterministic hash (djb2) to pick a color from the palette.
 * Same approach used in PlaceholderTile from @travel/ui.
 */
function hashCode(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
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

function getInitials(name: string | null, email: string): string {
  if (name) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }
  }
  return email.charAt(0).toUpperCase();
}

interface UserAvatarProps {
  name: string | null;
  picture: string | null;
  email: string;
  size?: number;
}

export function UserAvatar({ name, picture, email, size = 32 }: UserAvatarProps) {
  if (picture) {
    return (
      <img
        src={picture}
        alt={name ?? email}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  const seed = name ?? email;
  const bg = PALETTE[hashCode(seed) % PALETTE.length];
  const initials = getInitials(name, email);

  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        color: '#fff',
        fontWeight: 600,
        fontSize: size * 0.4,
        userSelect: 'none',
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
