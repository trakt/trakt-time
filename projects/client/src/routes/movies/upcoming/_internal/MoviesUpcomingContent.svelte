<script lang="ts">
  import { toLocalDayKey } from '$lib/utils/date/toLocalDayKey.ts';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import UpcomingBoard from '$lib/sections/lists/upcoming/UpcomingBoard.svelte';
  import MovieCard from '$lib/components/media-card/MovieCard.svelte';
  import InfiniteScrollTrigger from '$lib/components/infinite-scroll/InfiniteScrollTrigger.svelte';
  import {
    CALENDAR_WINDOW_COUNT,
    CALENDAR_WINDOW_DAYS,
  } from '$lib/requests/_internal/toCalendarWindow.ts';
  import { usePaginatedListQuery } from '$lib/sections/lists/stores/usePaginatedListQuery.ts';
  import { upcomingMoviesQuery } from '$lib/requests/queries/calendars/upcomingMoviesQuery.ts';

  const DAYS_AHEAD = CALENDAR_WINDOW_DAYS * CALENDAR_WINDOW_COUNT;
  const startDate = toLocalDayKey(new Date());

  const { list, isLoading, hasNextPage, pageCount, fetchNextPage } =
    usePaginatedListQuery(upcomingMoviesQuery({ startDate, filter: {} }));
</script>

<div class="upcoming-page">
  {#if $isLoading && $pageCount === 0}
    <div class="loading-state">
      <LoadingIndicator />
    </div>
  {:else if $list.length === 0 && !$hasNextPage}
    <div class="empty-state">
      <p>No upcoming movies in the next {DAYS_AHEAD} days.</p>
    </div>
  {:else}
    <UpcomingBoard
      items={$list}
      toDayKey={(entry) => toLocalDayKey(entry.effectiveReleaseDate ?? entry.releaseDate)}
      getKey={(entry) => entry.id}
    >
      {#snippet card(entry)}
        <MovieCard {entry} />
      {/snippet}
    </UpcomingBoard>
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
