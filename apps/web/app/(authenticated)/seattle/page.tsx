import Link from "next/link";
import { DiscoverGrid } from "./DiscoverGrid";

const WIKI_SUMMARY = "https://en.wikipedia.org/api/rest_v1/page/summary";

interface WikiCard {
  title: string;
  description: string;
  imageUrl: string | null;
  thumbUrl: string | null;
  pageUrl: string;
  extract: string;
}

const CATEGORIES = [
  { label: "Things to Do", query: "Seattle attractions landmarks activities" },
  { label: "Food & Drink", query: "Seattle restaurants food scene dining" },
  { label: "Neighborhoods", query: "Seattle neighborhoods Capitol Hill Fremont Ballard" },
  { label: "Nature & Parks", query: "Seattle parks hiking nature trails" },
  { label: "Arts & Culture", query: "Seattle museums art galleries culture" },
  { label: "Sports", query: "Seattle sports teams Seahawks Mariners Kraken" },
  { label: "Nightlife", query: "Seattle nightlife bars live music" },
  { label: "Day Trips", query: "Seattle day trips San Juan Islands Mount Rainier" },
];

const SEED_TOPICS = [
  "Pike Place Market", "Space Needle", "Museum of Pop Culture",
  "Kerry Park", "Chihuly Garden and Glass", "Seattle Great Wheel",
  "Olympic Sculpture Park", "Gas Works Park", "Fremont Troll",
  "Seattle waterfront", "Capitol Hill Seattle", "Ballard Seattle",
  "Mount Rainier", "San Juan Islands", "Puget Sound",
  "Seattle Art Museum", "Discovery Park", "Alki Beach",
  "University of Washington", "Lake Union", "Pioneer Square Seattle",
  "International District Seattle", "Green Lake Seattle", "Woodland Park Zoo",
];

async function fetchCard(title: string): Promise<WikiCard | null> {
  try {
    const res = await fetch(
      `${WIKI_SUMMARY}/${encodeURIComponent(title)}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.type === "disambiguation") return null;
    const thumb = data.thumbnail?.source;
    if (!thumb) return null;

    return {
      title: data.titles?.normalized ?? title,
      description: data.description ?? "",
      imageUrl: data.originalimage?.source ?? thumb,
      thumbUrl: thumb,
      pageUrl: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      extract: data.extract ?? "",
    };
  } catch {
    return null;
  }
}

export default async function SeattleDiscoverPage() {
  const results = await Promise.all(SEED_TOPICS.map(fetchCard));
  const initialCards = results.filter((c): c is WikiCard => c !== null);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-6">
        {/* Header */}
        <div className="mb-2 flex items-center gap-3">
          <Link
            href="/trips"
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </Link>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Explore</p>
            <h1 className="text-3xl font-bold">Seattle</h1>
          </div>
        </div>

        <p className="mb-8 max-w-2xl text-sm text-zinc-400">
          Discover your next adventure. Explore attractions, food, neighborhoods, and more
          powered by Wikipedia.
        </p>

        {/* Sub-navigation */}
        <div className="mb-6 flex gap-4 border-b border-zinc-800 pb-3">
          <Link href="/seattle" className="text-sm font-medium text-white border-b-2 border-white pb-3 -mb-3">
            Discover
          </Link>
          <Link href="/seattle/planning" className="text-sm text-zinc-500 hover:text-zinc-300 pb-3 -mb-3">
            Planning
          </Link>
          <Link href="/seattle/while-in-seattle" className="text-sm text-zinc-500 hover:text-zinc-300 pb-3 -mb-3">
            While There
          </Link>
          <Link href="/seattle/while-in-seattle/sports" className="text-sm text-zinc-500 hover:text-zinc-300 pb-3 -mb-3">
            Sports
          </Link>
        </div>

        <DiscoverGrid
          initialQuery="Seattle travel"
          initialCards={initialCards}
          categories={CATEGORIES}
        />
      </div>
    </div>
  );
}
