import type { UserHistory } from '$lib/features/auth/stores/useCurrentUserHistory.ts';
import type { UserRatings } from '$lib/features/auth/queries/currentUserRatingsQuery.ts';
import type { MediaStoreProps } from '$lib/models/MediaStoreProps.ts';

type FindOrphanedRatingIdsParams = {
  target: MediaStoreProps;
  history: UserHistory;
  ratings: UserRatings;
};

const isWatchedEpisode = (
  { history, showId, episodeId }: {
    history: UserHistory;
    showId: number;
    episodeId: number;
  },
) =>
  history.shows.get(showId)?.episodes.some((entry) =>
    entry.episodeId === episodeId
  ) ?? false;

export function findOrphanedRatingIds(
  { target, history, ratings }: FindOrphanedRatingIdsParams,
): number[] {
  const media = Array.isArray(target.media) ? target.media : [target.media];

  const isOrphaned = ({ id }: { id: number }): boolean => {
    switch (target.type) {
      case 'movie':
        return ratings.movies.has(id) && history.movies.has(id);
      case 'show':
        return ratings.shows.has(id) && history.shows.has(id);
      case 'episode':
        return ratings.episodes.has(id) &&
          isWatchedEpisode({
            history,
            showId: target.show.id,
            episodeId: id,
          });
    }
  };

  return media.filter(isOrphaned).map(({ id }) => id);
}
