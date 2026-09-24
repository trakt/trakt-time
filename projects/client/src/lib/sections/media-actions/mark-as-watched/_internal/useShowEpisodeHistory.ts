import { browser } from '$app/environment';
import { useUser } from '$lib/features/auth/stores/useUser.ts';
import { useQueryClient } from '$lib/features/query/_internal/queryClientContext.ts';
import type { EpisodeEntry } from '$lib/requests/models/EpisodeEntry.ts';
import { InvalidateAction } from '$lib/requests/models/InvalidateAction.ts';
import { showSeasonEpisodesQuery } from '$lib/requests/queries/shows/showSeasonEpisodesQuery.ts';
import { markAsWatchedRequest } from '$lib/requests/sync/markAsWatchedRequest.ts';
import { useInvalidator } from '$lib/stores/useInvalidator.ts';
import { resolve } from '$lib/utils/store/resolve.ts';
import { time } from '$lib/utils/timing/time.ts';
import { filter } from 'rxjs';
import type { MarkAsWatchedAt } from '../../../../models/MarkAsWatchedAt.ts';

type UseShowEpisodeHistoryProps = {
  slug: string;
  showId: number;
};

type MarkEpisodesParams = {
  ids: ReadonlyArray<number>;
  watchedAt: Exclude<MarkAsWatchedAt, Date>;
};

export function useShowEpisodeHistory(
  { slug, showId }: UseShowEpisodeHistoryProps,
) {
  const client = browser ? useQueryClient() : undefined;
  const { history } = useUser();
  const { invalidate } = useInvalidator();

  const settledHistory = history.pipe(filter((value) => value !== null));

  const resolveWatched = async () => {
    const watchedShow = (await resolve(settledHistory, time.seconds(10)))
      .shows.get(showId);

    return {
      watchedEpisodeIds: new Set(
        watchedShow?.episodes.map((episode) => episode.episodeId) ?? [],
      ),
      watchedCountBySeason: watchedShow?.playsPerSeason ??
        new Map<number, number>(),
    };
  };

  const fetchSeasonEpisodes = async (
    season: number,
  ): Promise<ReadonlyArray<EpisodeEntry>> =>
    await client?.fetchQuery(showSeasonEpisodesQuery({ slug, season })) ?? [];

  const markEpisodesAsWatched = async (
    { ids, watchedAt }: MarkEpisodesParams,
  ) => {
    if (ids.length === 0) return;

    await markAsWatchedRequest({
      body: {
        episodes: ids.map((id) => ({
          ids: { trakt: id },
          watched_at: watchedAt,
        })),
      },
    });
    await invalidate(InvalidateAction.MarkAsWatched('episode'));
  };

  return { resolveWatched, fetchSeasonEpisodes, markEpisodesAsWatched };
}
