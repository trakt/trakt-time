<script lang="ts">
  import { capitalizeFirst } from '$lib/utils/string/capitalizeFirst.ts';
  import { languageTag } from '$lib/features/i18n/index.ts';
  import { daysFromToday, toLocalDayKey } from '$lib/utils/date/toLocalDayKey.ts';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import GroupHeader from '$lib/components/group-header/GroupHeader.svelte';
  import MovieCard from '$lib/components/media-card/MovieCard.svelte';
  import InfiniteScrollTrigger from '$lib/components/infinite-scroll/InfiniteScrollTrigger.svelte';
  import {
    CALENDAR_WINDOW_COUNT,
    CALENDAR_WINDOW_DAYS,
  } from '$lib/requests/_internal/toCalendarWindow.ts';
  import { usePaginatedListQuery } from '$lib/sections/lists/stores/usePaginatedListQuery.ts';
  import { upcomingMoviesQuery } from '$lib/requests/queries/calendars/upcomingMoviesQuery.ts';
  import type { MovieEntry } from '$lib/requests/models/MovieEntry.ts';

  const DAYS_AHEAD = CALENDAR_WINDOW_DAYS * CALENDAR_WINDOW_COUNT;
  const startDate = toLocalDayKey(new Date());
  const locale = languageTag();

  const { list, isLoading, hasNextPage, pageCount, fetchNextPage } =
    usePaginatedListQuery(upcomingMoviesQuery({ startDate, filter: {} }));

  function toGroupLabel(dateKey: string): string {
    const diffDays = daysFromToday(dateKey);

    if (diffDays <= 0) {
      return capitalizeFirst(
        new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(0, 'day'),
        locale,
      );
    }

    const date = new Date(dateKey + 'T12:00:00');

    if (diffDays <= 7) {
      return capitalizeFirst(
        new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date),
        locale,
      );
    }

    return capitalizeFirst(
      new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(date),
      locale,
    );
  }

  type MovieGroup = { key: string; label: string; items: MovieEntry[] };

  const groups = $derived.by<MovieGroup[]>(() => {
    const entries = $list;
    const grouped = new Map<string, MovieEntry[]>();

    for (const entry of entries) {
      const key = toLocalDayKey(entry.effectiveReleaseDate ?? entry.releaseDate);
      const bucket = grouped.get(key) ?? [];
      bucket.push(entry);
      grouped.set(key, bucket);
    }

    // Key on the day, not the label: anything already released labels as TODAY.
    return [...grouped.entries()].map(([key, items]) => ({
      key,
      label: toGroupLabel(key),
      items,
    }));
  });
</script>

<div class="upcoming-page">
  {#if $isLoading && $pageCount === 0}
    <div class="loading-state">
      <LoadingIndicator />
    </div>
  {:else if groups.length === 0 && !$hasNextPage}
    <div class="empty-state">
      <p>No upcoming movies in the next {DAYS_AHEAD} days.</p>
    </div>
  {:else}
    {#each groups as group (group.key)}
      <GroupHeader label={group.label} />
      {#each group.items as entry (entry.id)}
        <MovieCard {entry} />
      {/each}
    {/each}
    <InfiniteScrollTrigger
      hasMore={$hasNextPage}
      isLoading={$isLoading}
      count={$pageCount}
      onload={fetchNextPage}
    />
  {/if}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .upcoming-page {
    display: flex;
    flex-direction: column;
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--gap-xxl) var(--gap-m);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }
</style>
