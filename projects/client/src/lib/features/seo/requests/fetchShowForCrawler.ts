import { mapToShowEntry } from '$lib/requests/_internal/mapToShowEntry.ts';
import { unauthorizedApi } from '$lib/requests/api.ts';
import type { ShowEntry } from '$lib/requests/models/ShowEntry.ts';

type FetchShowParams = {
  fetch: typeof fetch;
  slug: string;
};

export async function fetchShowForCrawler(
  { fetch, slug }: FetchShowParams,
): Promise<ShowEntry | null> {
  const response = await unauthorizedApi({ fetch })
    .shows
    .summary({
      params: { id: slug },
      query: { extended: 'full,images' },
    })
    .catch(() => null);

  if (response?.status !== 200) return null;
  return mapToShowEntry(response.body);
}
