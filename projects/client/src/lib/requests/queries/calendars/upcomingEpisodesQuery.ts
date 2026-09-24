import { defineInfiniteQuery } from '$lib/features/query/defineQuery.ts';
import {
  CALENDAR_WINDOW_DAYS,
  toCalendarPageMeta,
  toCalendarWindowStart,
} from '$lib/requests/_internal/toCalendarWindow.ts';
import { PaginatableSchemaFactory } from '$lib/requests/models/Paginatable.ts';
import { coalesceEpisodes } from '$lib/requests/_internal/coalesceEpisodes.ts';
import { mapToEpisodeEntry } from '$lib/requests/_internal/mapToEpisodeEntry.ts';
import { mapToShowEntry } from '$lib/requests/_internal/mapToShowEntry.ts';
import { api, type ApiParams } from '$lib/requests/api.ts';
import { InvalidateAction } from '$lib/requests/models/InvalidateAction.ts';
import { ShowEntrySchema } from '$lib/requests/models/ShowEntry.ts';
import { time } from '$lib/utils/timing/time.ts';
import { z } from 'zod';
import { getGlobalFilterDependencies } from '../../_internal/getGlobalFilterDependencies.ts';
import { EpisodeEntrySchema } from '../../models/EpisodeEntry.ts';
import type { FilterParams } from '../../models/FilterParams.ts';

export type CalendarShowsParams =
  & {
    startDate: string;
    page?: number;
  }
  & ApiParams
  & FilterParams;

export const UpcomingEpisodeEntrySchema = EpisodeEntrySchema.merge(z.object({
  show: ShowEntrySchema,
}));
export type UpcomingEpisodeEntry = z.infer<typeof UpcomingEpisodeEntrySchema>;

export const upcomingEpisodesRequest = (
  { fetch, startDate, page, filter }: CalendarShowsParams,
) =>
  api({ fetch })
    .calendars
    .shows({
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

export const upcomingEpisodesQuery = defineInfiniteQuery({
  key: 'upcomingEpisodes',
  invalidations: [
    InvalidateAction.Watchlisted('show'),
    InvalidateAction.MarkAsWatched('episode'),
    InvalidateAction.MarkAsWatched('show'),
    InvalidateAction.Drop('show'),
  ],
  dependencies: (
    params,
  ) => [
    params.startDate,
    ...getGlobalFilterDependencies(params.filter),
  ],
  request: upcomingEpisodesRequest,
  mapper: (response, { page }) => {
    const episodes = response.body.map((item) => ({
      show: mapToShowEntry(item.show),
      ...mapToEpisodeEntry(item.episode),
    }));

    return {
      entries: coalesceEpisodes(episodes),
      page: toCalendarPageMeta(page),
    };
  },
  schema: PaginatableSchemaFactory(UpcomingEpisodeEntrySchema),
  ttl: time.minutes(30),
  refetchOnWindowFocus: true,
});
