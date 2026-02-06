/**
 * Deterministic search-link builder for one-click external searches.
 *
 * Generates ActionLink[] for: Google, Reddit, Wikipedia, and
 * Expedia (via Google site:expedia.com).
 */

export interface ActionLink {
  label: string;
  provider: 'google' | 'reddit' | 'wikipedia' | 'expedia';
  url: string;
  icon?: string;
}

function encodeQuery(query: string): string {
  return encodeURIComponent(query.trim());
}

/** Google web search */
export function googleSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeQuery(query)}`;
}

/** Reddit search (via Google site:reddit.com for better results) */
export function redditSearchUrl(query: string): string {
  return `https://www.google.com/search?q=site%3Areddit.com+${encodeQuery(query)}`;
}

/** Wikipedia search */
export function wikipediaSearchUrl(query: string): string {
  return `https://en.wikipedia.org/w/index.php?search=${encodeQuery(query)}`;
}

/** Expedia search via Google site search */
export function expediaSearchUrl(query: string): string {
  return `https://www.google.com/search?q=site%3Aexpedia.com+${encodeQuery(query)}`;
}

/**
 * Build a deterministic list of ActionLinks for a given search query.
 * The query is typically a destination or trip-item title.
 */
export function buildSearchLinks(query: string): ActionLink[] {
  if (!query.trim()) return [];

  return [
    { label: 'Google', provider: 'google', url: googleSearchUrl(query) },
    { label: 'Reddit', provider: 'reddit', url: redditSearchUrl(query) },
    { label: 'Wikipedia', provider: 'wikipedia', url: wikipediaSearchUrl(query) },
    { label: 'Expedia', provider: 'expedia', url: expediaSearchUrl(query) },
  ];
}
