import { useInfiniteQuery } from '$lib/features/query/useQuery.ts';
import {
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  tap,
} from 'rxjs';
import {
  currentUserWatchedMoviesQuery,
  type WatchedMovie,
} from '../queries/currentUserWatchedMoviesQuery.ts';
import {
  currentUserWatchedShowsQuery,
  type WatchedShow,
} from '../queries/currentUserWatchedShowsQuery.ts';

const showsHistoryLimit = 1000;
const moviesHistoryLimit = 10000;

export type UserHistory = {
  movies: Map<number, WatchedMovie>;
  shows: Map<number, WatchedShow>;
};

function toWatchedMap<T extends { id: number }>(
  entries: T[],
): Map<number, T> {
  return new Map(entries.map((entry) => [entry.id, entry]));
}

type HistoryPages<T> = { pages: Array<{ entries: T[] }> };

function toQueryMap<T extends { id: number }>(
  data: HistoryPages<T> | undefined,
): Map<number, T> {
  return toWatchedMap(data?.pages.flatMap((p) => p.entries) ?? []);
}

function isSettled(
  query: { isPending: boolean; isFetchingNextPage: boolean },
): boolean {
  return !query.isPending && !query.isFetchingNextPage;
}

type UseCurrentUserHistoryResult = {
  history: Observable<UserHistory | null>;
  isLoading: Observable<boolean>;
};

export function useCurrentUserHistory(): UseCurrentUserHistoryResult {
  const moviesQuery = useInfiniteQuery(
    currentUserWatchedMoviesQuery({ limit: moviesHistoryLimit }),
  );
  const showsQuery = useInfiniteQuery(
    currentUserWatchedShowsQuery({ limit: showsHistoryLimit }),
  );

  const history = combineLatest([moviesQuery, showsQuery]).pipe(
    tap(([movies, shows]) => {
      [movies, shows]
        .filter((q) => q.hasNextPage && !q.isFetchingNextPage)
        .forEach((q) => q.fetchNextPage());
    }),
    map(([movies, shows]) => {
      if (!isSettled(movies) || !isSettled(shows)) {
        return null;
      }

      return { movies: movies.data, shows: shows.data };
    }),
    distinctUntilChanged((prev, curr) =>
      prev === curr ||
      (prev !== null && curr !== null &&
        prev.movies === curr.movies && prev.shows === curr.shows)
    ),
    map((settled) => {
      if (settled === null) {
        return null;
      }

      return {
        movies: toQueryMap(settled.movies),
        shows: toQueryMap(settled.shows),
      };
    }),
  );

  const isLoading = combineLatest([moviesQuery, showsQuery]).pipe(
    map(([movies, shows]) => !isSettled(movies) || !isSettled(shows)),
  );

  return { history, isLoading };
}
