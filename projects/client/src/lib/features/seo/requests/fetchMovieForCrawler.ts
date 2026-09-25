import { mapToMovieEntry } from '$lib/requests/_internal/mapToMovieEntry.ts';
import { unauthorizedApi } from '$lib/requests/api.ts';
import type { MovieEntry } from '$lib/requests/models/MovieEntry.ts';

type FetchMovieParams = {
  fetch: typeof fetch;
  slug: string;
};

export async function fetchMovieForCrawler(
  { fetch, slug }: FetchMovieParams,
): Promise<MovieEntry | null> {
  const response = await unauthorizedApi({ fetch })
    .movies
    .summary({
      params: { id: slug },
      query: { extended: 'full,images' },
    })
    .catch(() => null);

  if (response?.status !== 200) return null;
  return mapToMovieEntry(response.body);
}
