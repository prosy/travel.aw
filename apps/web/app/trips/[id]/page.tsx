import { QuickSearchChips } from './QuickSearchChips';

// TODO: This is a minimal page for Session 4 (searchlinks).
// Session 2 (codex-ui) provides the full trip detail page.
// At merge, keep Session 2's page and integrate QuickSearchChips into it.

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: Props) {
  const { id } = await params;

  // TODO: Replace with real trip fetch from API
  const destination = 'Tokyo, Japan';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-4 text-2xl font-bold">Trip {id}</h1>
      <p className="mb-4 text-sm text-zinc-500">{destination}</p>

      <div className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-zinc-600">Quick searches</h2>
        <QuickSearchChips query={destination} />
      </div>
    </div>
  );
}
