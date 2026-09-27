import { useUser } from '$lib/features/auth/stores/useUser.ts';
import type { EpisodeActivityHistory } from '$lib/requests/queries/users/episodeActivityHistoryQuery.ts';
import {
  type MovieActivityHistory,
  movieActivityHistoryQuery,
} from '$lib/requests/queries/users/movieActivityHistoryQuery.ts';
import { showActivityHistoryQuery } from '$lib/requests/queries/users/showActivityHistoryQuery.ts';
import { usePaginatedListQuery } from '$lib/sections/lists/stores/usePaginatedListQuery.ts';
import { combineLatest, map } from 'rxjs';
import { type RecapWatch, toMonthRecap } from './toMonthRecap.ts';
import { toMonthStats, toScreenTime, type Watch } from './toWatchStats.ts';

const HISTORY_WINDOW_IN_DAYS = 60;
const HISTORY_LIMIT = 1000;
const RECENT_COUNT = 10;

export type RecentWatch = MovieActivityHistory | EpisodeActivityHistory;

const toWatch = (entry: RecentWatch): Watch => ({
  watchedAt: entry.watchedAt,
  runtime: entry.type === 'movie'
    ? entry.movie.runtime
    : entry.episode.runtime || entry.show.runtime,
});

const toRecapWatch = (entry: RecentWatch): RecapWatch => ({
  watchedAt: entry.watchedAt,
  minutes: toWatch(entry).runtime,
  showTitle: entry.type === 'episode' ? entry.show.title : null,
  genres: entry.type === 'movie' ? entry.movie.genres : entry.show.genres,
});

function toHistoryWindow(now: Date) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return {
    startDate: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - HISTORY_WINDOW_IN_DAYS,
    ),
    endDate: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    ),
  };
}

function countRatingsSince(
  ratings: ReadonlyArray<ReadonlyMap<number, { ratedAt: Date }>>,
  since: Date,
): number {
  return ratings
    .flatMap((entries) => [...entries.values()])
    .filter((entry) => entry.ratedAt >= since)
    .length;
}

export function useProfileActivity(
  { slug, isOwner }: { slug: string; isOwner: boolean },
) {
  const now = new Date();
  const params = { slug, limit: HISTORY_LIMIT, ...toHistoryWindow(now) };

  const movies = usePaginatedListQuery(movieActivityHistoryQuery(params));
  const episodes = usePaginatedListQuery(showActivityHistoryQuery(params));
  const { ratings } = useUser();

  const history = combineLatest([movies.list, episodes.list]).pipe(
    map(([$movies, $episodes]) =>
      [...$movies, ...$episodes].toSorted(
        (a, b) => b.watchedAt.getTime() - a.watchedAt.getTime(),
      )
    ),
  );
  const watches = history.pipe(map((entries) => entries.map(toWatch)));

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    isLoading: combineLatest([movies.isLoading, episodes.isLoading]).pipe(
      map((states) => states.some(Boolean)),
    ),
    recent: history.pipe(map((entries) => entries.slice(0, RECENT_COUNT))),
    month: combineLatest([watches, ratings]).pipe(
      map(([$watches, $ratings]) => ({
        ...toMonthStats({ watches: $watches, now }),
        ratings: isOwner && $ratings
          ? countRatingsSince(
            [$ratings.movies, $ratings.shows, $ratings.episodes],
            monthStart,
          )
          : null,
      })),
    ),
    screenTime: watches.pipe(
      map(($watches) => toScreenTime({ watches: $watches, now })),
    ),
    lastMonth: history.pipe(
      map((entries) =>
        toMonthRecap({ watches: entries.map(toRecapWatch), now })
      ),
    ),
  };
}
