import { browser } from '$app/environment';
import { useQueryClient } from '$lib/features/query/_internal/queryClientContext.ts';
import type { CreateQueryOptions } from '$lib/features/query/types.ts';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { debounceTime, map, shareReplay, switchMap, tap } from 'rxjs/operators';
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

function modeToQuery(
  query: string,
  mode: SearchMode,
  config: TypesenseConfig,
  exact: boolean,
) {
  const limit = DEFAULT_SEARCH_LIMIT;

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
      }) as CreateQueryOptions<SearchResponse>;
    }
    case 'people':
      return searchPeopleQuery({
        query,
        config,
        limit,
      }) as CreateQueryOptions<SearchResponse>;
    case 'lists':
      return searchListsQuery({
        query,
        limit,
      }) as CreateQueryOptions<SearchResponse>;
    default:
      throw new Error(`Unsupported search mode: ${mode}`);
  }
}

function modeToTrendingQuery(query: string, mode: SearchMode) {
  switch (mode) {
    case 'media':
    case 'movie':
    case 'show': {
      return searchTrendingQuery({
        query,
      }) as CreateQueryOptions<TrendingSearchesResult>;
    }
    default:
      throw new Error(`Unsupported trending search mode: ${mode}`);
  }
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
          switchMap(([rawTerm, currentMode]) => {
            const term = rawTerm.toLowerCase().trim();

            if (term.trim().length === 0) {
              return of(null);
            }

            isSearching.next(true);
            track({ mode: currentMode });

            const searchQuery = client.fetchQuery(
              modeToQuery(term, currentMode, config, false),
            );

            if (currentMode === 'people' || currentMode === 'lists') {
              return searchQuery;
            }

            const trendingQuery = client.fetchQuery(
              modeToTrendingQuery(term, currentMode),
            );

            const exactQuery = client.fetchQuery(
              modeToQuery(term, currentMode, config, true),
            );
            return combineLatest([exactQuery, searchQuery, trendingQuery]).pipe(
              map(([exactResults, searchResults, trendingResults]) => ({
                type: 'media' as const,
                items: dedupe(
                  (item) => item.key,
                  (exactResults as MediaSearchResult).items,
                  trendingResults?.items ?? [],
                  (searchResults as MediaSearchResult).items,
                ),
              })),
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
