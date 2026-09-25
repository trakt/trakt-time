import { mapToPersonSummary } from '$lib/requests/_internal/mapToPersonSummary.ts';
import { unauthorizedApi } from '$lib/requests/api.ts';
import type { PersonSummary } from '$lib/requests/models/PersonSummary.ts';

type FetchPersonParams = {
  fetch: typeof fetch;
  slug: string;
};

export async function fetchPersonForCrawler(
  { fetch, slug }: FetchPersonParams,
): Promise<PersonSummary | null> {
  const response = await unauthorizedApi({ fetch })
    .people
    .summary({
      params: { id: slug },
      query: { extended: 'full,images' },
    })
    .catch(() => null);

  if (response?.status !== 200) return null;
  return mapToPersonSummary(response.body);
}
