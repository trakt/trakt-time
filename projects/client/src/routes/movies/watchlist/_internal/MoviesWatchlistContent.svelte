<script lang="ts">
  import CtaLink from '$lib/components/link/CtaLink.svelte';
  import GroupHeader from '$lib/components/group-header/GroupHeader.svelte';
  import MovieCard from '$lib/components/media-card/MovieCard.svelte';
  import WatchedMovieHistoryRow from '$lib/components/media-card/WatchedMovieHistoryRow.svelte';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import LoadMoreButton from '$lib/components/load-more-button/LoadMoreButton.svelte';
  import { useWatchList } from '$lib/sections/lists/watchlist/useWatchList.ts';
  import { useAnchoredHistoryLoad } from '$lib/sections/lists/stores/useAnchoredHistoryLoad.svelte.ts';
  import { useRecentlyWatchedList } from '$lib/sections/lists/stores/useRecentlyWatchedList.ts';
  import { useWatchlistReveal } from '$lib/sections/lists/stores/useWatchlistReveal.svelte.ts';
  import type { MovieActivityHistory } from '$lib/requests/queries/users/movieActivityHistoryQuery.ts';
  import * as m from '$lib/paraglide/messages.js';

  const { list, isLoading, hasNextPage, fetchNextPage } = useWatchList({
    type: 'movie',
    limit: 30,
    filter: {},
    intent: 'start',
  });

  const {
    list: historyList,
    isLoading: historyLoading,
    hasNextPage: historyHasNextPage,
    fetchNextPage: fetchOlderHistory,
  } = useRecentlyWatchedList({ type: 'movie', limit: 10 });

  // Most-recent first becomes most-recent NEAR the WATCHLIST divider; reverse.
  const historyEntries = $derived(
    [...($historyList as unknown as MovieActivityHistory[])].reverse(),
  );

  // "Load older" prepends rows above the viewport (history renders
  // oldest-first at the top); keep the viewport anchored on what the
  // user is reading.
  const loadOlderHistory = useAnchoredHistoryLoad({
    loading: () => $historyLoading,
    entryCount: () => historyEntries.length,
    fetchOlder: fetchOlderHistory,
  });

  // Land the viewport on the WATCHLIST divider before revealing the page.
  let watchlistAnchor = $state<HTMLElement | null>(null);
  const reveal = useWatchlistReveal({
    loading: () => $isLoading || $historyLoading,
    hasHistory: () => historyEntries.length > 0,
    hasContent: () => $list.length > 0,
    anchor: () => watchlistAnchor,
  });
</script>

<div class="watchlist-page" class:ready={reveal.isReady}>
  {#if ($isLoading || $historyLoading) && $list.length === 0 && historyEntries.length === 0}
    <div class="loading-state">
      <LoadingIndicator />
    </div>
  {:else if $list.length === 0 && historyEntries.length === 0}
    <div class="empty-state">
      <p>{m.text_empty_movie_watchlist()}</p>
      <CtaLink href="/settings">{m.welcome_tvtime_import_cta()}</CtaLink>
      <CtaLink href="/discover">{m.cta_explore_movies()}</CtaLink>
    </div>
  {:else}
    {#if historyEntries.length > 0}
      {#if $historyHasNextPage}
        <LoadMoreButton
          loading={$historyLoading}
          onclick={loadOlderHistory}
          label={m.button_text_load_older()}
          variant="older"
        />
      {/if}
      <GroupHeader label={m.header_watched_history()} />
      {#each historyEntries as entry (entry.key)}
        <WatchedMovieHistoryRow {entry} />
      {/each}
    {/if}

    {#if $list.length > 0}
      <div class="watchlist-anchor" bind:this={watchlistAnchor}>
        <GroupHeader label={m.header_watchlist()} />
      </div>
      {#each $list as item (item.id)}
        {#if item.type === 'movie'}
          <MovieCard entry={item.entry} />
        {/if}
      {/each}
    {/if}

    {#if $hasNextPage}
      <LoadMoreButton
        loading={$isLoading}
        onclick={fetchNextPage}
        label={m.button_text_load_more()}
      />
    {/if}
  {/if}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .watchlist-page {
    display: flex;
    flex-direction: column;

    /* Scroll position is compensated manually when older history loads;
       keep the browser's native scroll anchoring from double-adjusting. */
    overflow-anchor: none;

    visibility: hidden;

    &.ready {
      visibility: visible;
    }
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--gap-xxl) var(--gap-m);
    gap: var(--gap-m);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }

  .watchlist-anchor {
    scroll-margin-top: var(--ni-48);
  }
</style>
