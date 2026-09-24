import { defineInfiniteQuery } from '$lib/features/query/defineQuery.ts';
import {
  CALENDAR_WINDOW_DAYS,
  toCalendarPageMeta,
  toCalendarWindowStart,
} from '$lib/requests/_internal/toCalendarWindow.ts';
import { PaginatableSchemaFactory } from '$lib/requests/models/Paginatable.ts';
import { api, type ApiParams } from '$lib/requests/api.ts';
import { InvalidateAction } from '$lib/requests/models/InvalidateAction.ts';
import { time } from '$lib/utils/timing/time.ts';
import { getGlobalFilterDependencies } from '../../_internal/getGlobalFilterDependencies.ts';
import { mapToMovieEntry } from '../../_internal/mapToMovieEntry.ts';
import type { FilterParams } from '../../models/FilterParams.ts';
import { MovieEntrySchema } from '../../models/MovieEntry.ts';

export type CalendarMoviesParams =
  & {
    startDate: string;
    page?: number;
  }
  & ApiParams
  & FilterParams;

export const upcomingMoviesRequest = (
  { fetch, startDate, page, filter }: CalendarMoviesParams,
) =>
  api({ fetch })
    .calendars
    .movies({
      query: {
        extended: 'full,images',
        ...filter,
      },
      params: {
        target: 'my',
        start_date: toCalendarWindowStart({ startDate, page }),
        days: CALENDAR_WINDOW_DAYS,
      },
    });

export const upcomingMoviesQuery = defineInfiniteQuery({
  key: 'upcomingMovies',
  invalidations: [
    InvalidateAction.Watchlisted('movie'),
    InvalidateAction.MarkAsWatched('movie'),
  ],
  dependencies: (
    params,
  ) => [
    params.startDate,
    ...getGlobalFilterDependencies(params.filter),
  ],
  request: upcomingMoviesRequest,
  mapper: (response, { page }) => ({
    entries: response.body.map((entry) => mapToMovieEntry(entry.movie)),
    page: toCalendarPageMeta(page),
  }),
  schema: PaginatableSchemaFactory(MovieEntrySchema),
  ttl: time.minutes(30),
  refetchOnWindowFocus: true,
});
