import { mapToEpisodeEntry } from '$lib/requests/_internal/mapToEpisodeEntry.ts';
import { unauthorizedApi } from '$lib/requests/api.ts';
import type { EpisodeEntry } from '$lib/requests/models/EpisodeEntry.ts';
import { castNumberAsString } from '$lib/utils/requests/castNumberAsString.ts';

type FetchEpisodeParams = {
  fetch: typeof fetch;
  slug: string;
  season: number;
  episode: number;
};

export async function fetchEpisodeForCrawler(
  { fetch, slug, season, episode }: FetchEpisodeParams,
): Promise<EpisodeEntry | null> {
  const response = await unauthorizedApi({ fetch })
    .shows
    .episode
    .summary({
      params: { id: slug, season: castNumberAsString(season), episode },
      query: { extended: 'full,images' },
    })
    .catch(() => null);

  if (response?.status !== 200) return null;
  return mapToEpisodeEntry(response.body);
}
