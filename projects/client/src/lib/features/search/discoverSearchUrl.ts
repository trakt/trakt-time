export const DISCOVER_SEARCH_PARAM = 'q';

export function toDiscoverSearchUrl(term: string): string {
  const trimmed = term.trim();
  if (!trimmed) return '/discover';

  const params = new URLSearchParams({ [DISCOVER_SEARCH_PARAM]: term });
  return `/discover?${params}`;
}
