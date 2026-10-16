import { toMediaReactionsPath } from '$lib/requests/_internal/toMediaReactionsPath.ts';
import { type ApiParams, rawApiFetch } from '$lib/requests/api.ts';
import type { MediaType } from '$lib/requests/models/MediaType.ts';

type RemoveMediaReactionsParams = {
  type: MediaType;
  slug: string;
  ids: ReadonlyArray<number>;
} & ApiParams;

export async function removeMediaReactionsRequest(
  { fetch, type, slug, ids }: RemoveMediaReactionsParams,
): Promise<boolean> {
  const response = await rawApiFetch({
    fetch,
    path: `${toMediaReactionsPath(type, slug)}/${ids.join(',')}`,
    init: { method: 'DELETE' },
  });

  return response.ok;
}
