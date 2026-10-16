import { toMediaReactionsPath } from '$lib/requests/_internal/toMediaReactionsPath.ts';
import { type ApiParams, rawApiFetch } from '$lib/requests/api.ts';
import type { MediaReaction } from '$lib/requests/models/MediaReaction.ts';
import type { MediaType } from '$lib/requests/models/MediaType.ts';

type ReactMediaParams = {
  type: MediaType;
  slug: string;
  reaction: MediaReaction;
} & ApiParams;

export async function reactMediaRequest(
  { fetch, type, slug, reaction }: ReactMediaParams,
): Promise<boolean> {
  const response = await rawApiFetch({
    fetch,
    path: `${toMediaReactionsPath(type, slug)}/${reaction}`,
    init: { method: 'PUT' },
  });

  return response.ok;
}
