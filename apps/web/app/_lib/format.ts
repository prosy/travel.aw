/** Format a price for display */
export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

/** Format an ISO date string as "Apr 1, 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Format an ISO datetime string as "Apr 1, 10:30 AM" */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

/** Status badge color class */
export function statusColor(status: string): string {
  switch (status) {
    case 'confirmed':
    case 'booked':
    case 'completed':
      return 'bg-emerald-100 text-emerald-800';
    case 'pending':
    case 'draft':
    case 'planned':
      return 'bg-amber-100 text-amber-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-zinc-100 text-zinc-800';
  }
}

/** Type icon label */
export function typeIcon(type: string): string {
  switch (type) {
    case 'flight':
      return '\u2708';
    case 'hotel':
      return '\u{1F3E8}';
    case 'activity':
      return '\u{1F3AF}';
    case 'transport':
      return '\u{1F698}';
    case 'restaurant':
      return '\u{1F37D}';
    default:
      return '\u{1F4CC}';
  }
}
