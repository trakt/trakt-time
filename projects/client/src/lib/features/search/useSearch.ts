import { browser } from '$app/environment';
import { useQueryClient } from '$lib/features/query/_internal/queryClientContext.ts';
import type { CreateQueryOptions } from '$lib/features/query/types.ts';
import type { QueryClient, QueryKey } from '@tanstack/query-core';
import { BehaviorSubject, combineLatest, from, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';
import type { SearchMode } from '../../requests/queries/search/models/SearchMode.ts';
import { searchListsQuery } from '../../requests/queries/search/searchListsQuery.ts';
import {
  type MediaSearchResult,
  searchMediaQuery,
} from '../../requests/queries/search/searchMediaQuery.ts';
import { searchPeopleQuery } from '../../requests/queries/search/searchPeopleQuery.ts';
import {
  searchTrendingQuery,
  type TrendingSearchesResult,
} from '../../requests/queries/search/searchTrendingQuery.ts';
import { withSignal } from '../../requests/search/withSignal.ts';
import { dedupe } from '../../utils/array/dedupe.ts';
import { DEFAULT_SEARCH_LIMIT } from '../../utils/constants.ts';
import { time } from '../../utils/timing/time.ts';
import { AnalyticsEvent } from '../analytics/events/AnalyticsEvent.ts';
import { useTrack } from '../analytics/useTrack.ts';
import { getSearchContext } from './_internal/getSearchContext.ts';
import { mapToSearchCover } from './_internal/mapToSearchCover.ts';
import { postRecentSearch } from './_internal/postRecentSearch.ts';
import type { SearchResponse } from './models/SearchResponse.ts';

export const NAVIGATION_DEBOUNCE = time.seconds(0.12);
const QUERY_DEBOUNCE = time.seconds(0.03);

type SearchNavigationProps = {
  readValue: () => string;
  readUrlTerm: () => string;
  navigate: (term: string) => void;
};

export function createSearchNavigation({
  readValue,
  readUrlTerm,
  navigate,
}: SearchNavigationProps) {
  let pending: ReturnType<typeof setTimeout> | undefined;

  const cancel = () => clearTimeout(pending);

  function input() {
    cancel();

    const value = readValue();
    const opensResults = readUrlTerm().trim().length === 0;

    if (opensResults || value.trim().length === 0) {
      navigate(value);
      return;
    }

    pending = setTimeout(() => {
      const latest = readValue();
      if (latest === readUrlTerm()) return;

      navigate(latest);
    }, NAVIGATION_DEBOUNCE);
  }

  function clear() {
    cancel();
    navigate('');
  }

  return { input, clear, cancel };
}

type ModeQueryProps = {
  query: string;
  mode: SearchMode;
  config: TypesenseConfig;
  exact: boolean;
  signal: AbortSignal;
};

function modeToQuery({ query, mode, config, exact, signal }: ModeQueryProps) {
  const limit = DEFAULT_SEARCH_LIMIT;
  const fetch = withSignal(signal);

  switch (mode) {
    case 'media':
    case 'movie':
    case 'show': {
      const type = mode !== 'media' ? mode : undefined;
      return searchMediaQuery({
        query,
        type,
        config,
        limit,
        exact,
        signal,
        fetch,
      }) as CreateQueryOptions<SearchResponse>;
    }
    case 'people':
      return searchPeopleQuery({
        query,
        config,
        limit,
        signal,
        fetch,
      }) as CreateQueryOptions<SearchResponse>;
    case 'lists':
      return searchListsQuery({
        query,
        limit,
        fetch,
      }) as CreateQueryOptions<SearchResponse>;
    default:
      throw new Error(`Unsupported search mode: ${mode}`);
  }
}

type TrendingQueryProps = {
  query: string;
  mode: SearchMode;
  signal: AbortSignal;
};

function modeToTrendingQuery({ query, mode, signal }: TrendingQueryProps) {
  switch (mode) {
    case 'media':
    case 'movie':
    case 'show': {
      return searchTrendingQuery({
        query,
        fetch: withSignal(signal),
      }) as CreateQueryOptions<TrendingSearchesResult>;
    }
    default:
      throw new Error(`Unsupported trending search mode: ${mode}`);
  }
}

type CancelSearchQueriesProps = {
  client: QueryClient;
  controller: AbortController;
  queryKeys: ReadonlyArray<QueryKey>;
};

function cancelSearchQueries({
  client,
  controller,
  queryKeys,
}: CancelSearchQueriesProps) {
  queryKeys.forEach((queryKey) => {
    client.cancelQueries({ queryKey, exact: true });
  });
  controller.abort();
}

export function useSearch() {
  const client = browser ? useQueryClient() : undefined;
  const { mode, isSearching, config, ...rest } = getSearchContext();
  const { track } = useTrack(AnalyticsEvent.Search);

  const searchTerm$ = new BehaviorSubject<string>('');

  const results =
    client == null
      ? of(null)
      : combineLatest([searchTerm$, mode]).pipe(
          debounceTime(QUERY_DEBOUNCE),
          map(([rawTerm, currentMode]) => ({
            term: rawTerm.toLowerCase().trim(),
            mode: currentMode,
          })),
          distinctUntilChanged(
            (previous, next) =>
              previous.term === next.term && previous.mode === next.mode,
          ),
          switchMap(({ term, mode: currentMode }) => {
            if (term.length === 0) {
              return of(null);
            }

            isSearching.next(true);
            track({ mode: currentMode });

            const controller = new AbortController();
            const { signal } = controller;

            const searchOptions = modeToQuery({
              query: term,
              mode: currentMode,
              config,
              exact: false,
              signal,
            });

            if (currentMode === 'people' || currentMode === 'lists') {
              return from(client.fetchQuery(searchOptions)).pipe(
                finalize(() =>
                  cancelSearchQueries({
                    client,
                    controller,
                    queryKeys: [searchOptions.queryKey],
                  }),
                ),
              );
            }

            const trendingOptions = modeToTrendingQuery({
              query: term,
              mode: currentMode,
              signal,
            });

            const exactOptions = modeToQuery({
              query: term,
              mode: currentMode,
              config,
              exact: true,
              signal,
            });

            return combineLatest([
              client.fetchQuery(exactOptions),
              client.fetchQuery(searchOptions),
              client.fetchQuery(trendingOptions),
            ]).pipe(
              map(([exactResults, searchResults, trendingResults]) => ({
                type: 'media' as const,
                items: dedupe(
                  (item) => item.key,
                  (exactResults as MediaSearchResult).items,
                  trendingResults?.items ?? [],
                  (searchResults as MediaSearchResult).items,
                ),
              })),
              finalize(() =>
                cancelSearchQueries({
                  client,
                  controller,
                  queryKeys: [
                    exactOptions.queryKey,
                    searchOptions.queryKey,
                    trendingOptions.queryKey,
                  ],
                }),
              ),
            );
          }),
          tap(() => isSearching.next(false)),
          shareReplay(1),
        );

  const coverSrc = results.pipe(map(mapToSearchCover));

  function search(term: string, searchMode: SearchMode) {
    mode.next(searchMode);
    searchTerm$.next(term);
  }

  function clear() {
    searchTerm$.next('');
    isSearching.next(false);
  }

  return {
    postRecentSearch,
    search,
    results,
    coverSrc,
    clear,
    mode,
    isSearching,
    ...rest,
  };
}
