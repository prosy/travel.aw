const WIKI_API = 'https://en.wikipedia.org/api/rest_v1/page/summary';

export interface WikiImage {
  url: string;
  thumbUrl: string;
  alt: string;
  attribution: string;
}

/**
 * Fetch a destination hero image from Wikipedia REST API.
 * Extracts the first word/city from "Tokyo, Japan" style destinations.
 */
export async function fetchWikiImage(destination: string): Promise<WikiImage | null> {
  const query = destination.split(',')[0].trim();
  if (!query) return null;

  try {
    const res = await fetch(`${WIKI_API}/${encodeURIComponent(query)}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const original = data.originalimage?.source;
    const thumb = data.thumbnail?.source;

    if (!original && !thumb) return null;

    return {
      url: original ?? thumb,
      thumbUrl: thumb ?? original,
      alt: data.description ?? `Photo of ${query}`,
      attribution: 'Wikimedia Commons',
    };
  } catch {
    return null;
  }
}
