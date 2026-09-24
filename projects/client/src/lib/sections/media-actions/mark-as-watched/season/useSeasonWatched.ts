import { useUser } from '$lib/features/auth/stores/useUser.ts';
import { ConfirmationType } from '$lib/features/confirmation/models/ConfirmationType.ts';
import { useConfirm } from '$lib/features/confirmation/useConfirm.ts';
import { InvalidateAction } from '$lib/requests/models/InvalidateAction.ts';
import type { Season } from '$lib/requests/models/Season.ts';
import { removeRatingRequest } from '$lib/requests/sync/removeRatingRequest.ts';
import { removeWatchedRequest } from '$lib/requests/sync/removeWatchedRequest.ts';
import { toRemoveRatingsPayload } from '$lib/requests/sync/toRemoveRatingsPayload.ts';
import { useInvalidator } from '$lib/stores/useInvalidator.ts';
import { seasonLabel } from '$lib/utils/intl/seasonLabel.ts';
import { resolve } from '$lib/utils/store/resolve.ts';
import { BehaviorSubject, map } from 'rxjs';
import { useShowEpisodeHistory } from '../_internal/useShowEpisodeHistory.ts';

type UseSeasonWatchedProps = {
  slug: string;
  showId: number;
  season: Season;
};

export function useSeasonWatched(
  { slug, showId, season }: UseSeasonWatchedProps,
) {
  const { history, ratings } = useUser();
  const { invalidate } = useInvalidator();
  const { confirm } = useConfirm();
  const { resolveWatched, fetchSeasonEpisodes, markEpisodesAsWatched } =
    useShowEpisodeHistory({ slug, showId });

  const isUpdating = new BehaviorSubject(false);

  const watchedCount = history.pipe(
    map(($history) =>
      $history?.shows.get(showId)?.playsPerSeason.get(season.number) ?? 0
    ),
  );
  const isWatched = watchedCount.pipe(
    map((count) => count >= season.episodes.count),
  );

  const withUpdating = async (action: () => Promise<unknown>) => {
    isUpdating.next(true);
    await action().finally(() => isUpdating.next(false));
  };

  const markSeasonAsWatched = () =>
    withUpdating(async () => {
      const now = new Date();
      const [episodes, { watchedEpisodeIds }] = await Promise.all([
        fetchSeasonEpisodes(season.number),
        resolveWatched(),
      ]);

      await markEpisodesAsWatched({
        ids: episodes
          .filter((episode) => episode.effectiveReleaseDate <= now)
          .filter((episode) => !watchedEpisodeIds.has(episode.id))
          .map((episode) => episode.id),
        watchedAt: 'now',
      });
    });

  const removeSeasonFromWatched = confirm({
    type: ConfirmationType.RemoveFromWatched,
    title: seasonLabel(season.number),
    onConfirm: () =>
      withUpdating(async () => {
        const [episodes, { watchedEpisodeIds }, currentRatings] = await Promise
          .all([
            fetchSeasonEpisodes(season.number),
            resolveWatched(),
            resolve(ratings),
          ]);
        const orphanedRatingIds = episodes
          .map((episode) => episode.id)
          .filter((id) =>
            watchedEpisodeIds.has(id) && currentRatings.episodes.has(id)
          );

        await removeWatchedRequest({
          body: {
            episodes: episodes.map((episode) => ({
              ids: { trakt: episode.id },
            })),
          },
        });
        await invalidate(InvalidateAction.MarkAsWatched('episode'));

        if (orphanedRatingIds.length === 0) return;

        await removeRatingRequest({
          body: toRemoveRatingsPayload('episode', orphanedRatingIds),
        });
        await invalidate(InvalidateAction.Rated('episode'));
      }),
  });

  return {
    watchedCount,
    isWatched,
    isUpdating,
    markSeasonAsWatched,
    removeSeasonFromWatched,
  };
}
