import type { ExtendedMediaType } from '$lib/requests/models/ExtendedMediaType.ts';

type ToGifSuggestedQueryParams = {
  title: string;
  type: ExtendedMediaType;
};

export function toGifSuggestedQuery(
  { title, type }: ToGifSuggestedQueryParams,
) {
  return `${title} ${type}`;
}
