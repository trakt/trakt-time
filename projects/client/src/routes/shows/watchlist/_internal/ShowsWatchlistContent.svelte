<script lang="ts">
  import CtaLink from '$lib/components/link/CtaLink.svelte';
  import EpisodeCard from '$lib/components/media-card/EpisodeCard.svelte';
  import WatchedHistoryRow from '$lib/components/media-card/WatchedHistoryRow.svelte';
  import GroupHeader from '$lib/components/group-header/GroupHeader.svelte';
  import LoadMoreButton from '$lib/components/load-more-button/LoadMoreButton.svelte';
  import WatchlistSkeleton from '$lib/sections/lists/components/WatchlistSkeleton.svelte';
  import { useUpNextList } from '$lib/sections/lists/progress/useUpNextList.ts';
  import { useAnchoredHistoryLoad } from '$lib/sections/lists/stores/useAnchoredHistoryLoad.svelte.ts';
  import { useRecentlyWatchedList } from '$lib/sections/lists/stores/useRecentlyWatchedList.ts';
  import { useWatchlistReveal } from '$lib/sections/lists/stores/useWatchlistReveal.svelte.ts';
  import type { UpNextEntry } from '$lib/requests/models/UpNextEntry.ts';
  import type { EpisodeActivityHistory } from '$lib/requests/queries/users/episodeActivityHistoryQuery.ts';
  import * as m from '$lib/paraglide/messages.js';

  const DAYS_30 = 30 * 24 * 60 * 60 * 1000;

  const { list, isLoading, hasNextPage, fetchNextPage } = useUpNextList({
    type: 'show',
    limit: 30,
    filter: {},
  });

  const {
    list: historyList,
    isLoading: historyLoading,
    hasNextPage: historyHasNextPage,
    fetchNextPage: fetchOlderHistory,
  } = useRecentlyWatchedList({ type: 'episode', limit: 10 });

  type WatchNextGroup = { label: string; items: UpNextEntry[] };

  const groups = $derived.by<WatchNextGroup[]>(() => {
    const watchNext: UpNextEntry[] = [];
    const startWatching: UpNextEntry[] = [];
    const dormant: UpNextEntry[] = [];
    const now = Date.now();

    for (const entry of $list as UpNextEntry[]) {
      if (entry.lastWatchedAt == null) {
        // Never started: this is fresh "start watching" content,
        // not a stale series the user abandoned.
        startWatching.push(entry);
      } else if (now - entry.lastWatchedAt.getTime() >= DAYS_30) {
        dormant.push(entry);
      } else {
        watchNext.push(entry);
      }
    }

    const result: WatchNextGroup[] = [];
    if (watchNext.length > 0) {
      result.push({ label: m.header_watch_next(), items: watchNext });
    }
    if (startWatching.length > 0) {
      result.push({
        label: m.header_start_watching(),
        items: startWatching,
      });
    }
    if (dormant.length > 0) {
      result.push({ label: m.header_dormant_shows(), items: dormant });
    }
    return result;
  });

  // Most-recent first becomes most-recent NEAR the WATCH NEXT divider; reverse.
  const historyEntries = $derived(
    [...($historyList as unknown as EpisodeActivityHistory[])].reverse(),
  );

  // "Load older" prepends rows above the viewport (history renders
  // oldest-first at the top); keep the viewport anchored on what the
  // user is reading.
  const loadOlderHistory = useAnchoredHistoryLoad({
    loading: () => $historyLoading,
    entryCount: () => historyEntries.length,
    fetchOlder: fetchOlderHistory,
  });

  // Land the viewport on the WATCH NEXT divider before revealing the page.
  let watchNextAnchor = $state<HTMLElement | null>(null);
  const reveal = useWatchlistReveal({
    loading: () => $isLoading || $historyLoading,
    hasHistory: () => historyEntries.length > 0,
    hasContent: () => groups.length > 0,
    anchor: () => watchNextAnchor,
  });
</script>

<div class="watchlist-page" class:ready={reveal.isReady}>
  {#if ($isLoading || $historyLoading) && $list.length === 0 && historyEntries.length === 0}
    <div class="loading-state">
      <WatchlistSkeleton />
    </div>
  {:else if groups.length === 0 && historyEntries.length === 0}
    <div class="empty-state">
      <p>{m.text_empty_show_watchlist()}</p>
      <CtaLink href="/settings">{m.welcome_tvtime_import_cta()}</CtaLink>
      <CtaLink href="/discover">{m.cta_explore_shows()}</CtaLink>
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
        <WatchedHistoryRow {entry} />
      {/each}
    {/if}

    {#each groups as group, groupIndex (group.label)}
      {#if groupIndex === 0}
        <div class="watch-next-anchor" bind:this={watchNextAnchor}>
          <GroupHeader label={group.label} />
        </div>
      {:else}
        <GroupHeader label={group.label} />
      {/if}
      {#each group.items as entry (entry.show.id)}
        <EpisodeCard {entry} />
      {/each}
    {/each}

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

    /* Hide content until autoscroll has landed on the WATCH NEXT divider
       so the user never sees the page render at the top (where history
       sits) before snapping. */
    visibility: hidden;

    &.ready {
      visibility: visible;
    }
  }

  /* The skeleton previews the post-reveal viewport, so it stays visible
     while the rest of the page hides behind the reveal. */
  .loading-state {
    visibility: visible;
  }

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

  .watch-next-anchor {
    scroll-margin-top: var(--ni-48);
  }
</style>
