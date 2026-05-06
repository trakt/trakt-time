<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { tick } from 'svelte';
  import GroupHeader from '$lib/components/group-header/GroupHeader.svelte';
  import MovieCard from '$lib/components/media-card/MovieCard.svelte';
  import WatchedMovieHistoryRow from '$lib/components/media-card/WatchedMovieHistoryRow.svelte';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import LoadMoreButton from '$lib/components/load-more-button/LoadMoreButton.svelte';
  import { useWatchList } from '$lib/sections/lists/watchlist/useWatchList.ts';
  import { useRecentlyWatchedList } from '$lib/sections/lists/stores/useRecentlyWatchedList.ts';
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

  let watchlistAnchor = $state<HTMLElement | null>(null);
  let isReady = $state(false);
  let pendingScroll = $state(true);

  afterNavigate(async () => {
    pendingScroll = true;
    isReady = false;
    await tick();
  });

  $effect(() => {
    if (!pendingScroll) return;

    // Wait until both queries have settled. Without this guard, the
    // effect can fire mid-load (history loaded, watchlist still pending),
    // skip the scroll because the anchor isn't bound yet, and reveal
    // the page at the top.
    if ($isLoading || $historyLoading) return;

    // If we expect to scroll past the history block, the anchor must
    // already exist. If it doesn't yet (DOM hasn't reflected the
    // just-loaded list), defer one tick; the effect re-runs when
    // watchlistAnchor binds.
    if (historyEntries.length > 0 && $list.length > 0 && !watchlistAnchor) {
      return;
    }

    pendingScroll = false;
    if (watchlistAnchor && historyEntries.length > 0) {
      watchlistAnchor.scrollIntoView({ block: 'start' });
    }
    isReady = true;
  });
</script>

<div class="watchlist-page" class:ready={isReady}>
  {#if ($isLoading || $historyLoading) && $list.length === 0 && historyEntries.length === 0}
    <div class="loading-state">
      <LoadingIndicator />
    </div>
  {:else if $list.length === 0 && historyEntries.length === 0}
    <div class="empty-state">
      <p>{m.text_empty_movie_watchlist()}</p>
      <a href="/discover" class="cta-link">{m.cta_explore_movies()}</a>
    </div>
  {:else}
    {#if historyEntries.length > 0}
      {#if $historyHasNextPage}
        <LoadMoreButton
          loading={$historyLoading}
          onclick={fetchOlderHistory}
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

  .cta-link {
    color: var(--trakttime-accent);
    text-decoration: none;
    font-weight: 600;
  }

  .watchlist-anchor {
    scroll-margin-top: var(--ni-48);
  }
</style>
