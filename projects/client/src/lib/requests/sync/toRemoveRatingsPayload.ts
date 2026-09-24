import type { RemoveRatingsParams } from '@trakt/api';

type RatingMediaType = 'movie' | 'show' | 'episode';

export function toRemoveRatingsPayload(
  type: RatingMediaType,
  traktIds: ReadonlyArray<number>,
): RemoveRatingsParams {
  const items = traktIds.map((trakt) => ({ ids: { trakt } }));

  switch (type) {
    case 'movie':
      return { movies: items };
    case 'show':
      return { shows: items };
    case 'episode':
      return { episodes: items };
  }
}
