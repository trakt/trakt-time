<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { tick } from 'svelte';
  import EpisodeCard from '$lib/components/media-card/EpisodeCard.svelte';
  import WatchedHistoryRow from '$lib/components/media-card/WatchedHistoryRow.svelte';
  import GroupHeader from '$lib/components/group-header/GroupHeader.svelte';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import LoadMoreButton from '$lib/components/load-more-button/LoadMoreButton.svelte';
  import { useUpNextList } from '$lib/sections/lists/progress/useUpNextList.ts';
  import { useRecentlyWatchedList } from '$lib/sections/lists/stores/useRecentlyWatchedList.ts';
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

  // The page is rendered with visibility:hidden until we've landed the
  // viewport on the WATCH NEXT divider so the user never sees a scroll
  // jump. Re-runs on every navigation (afterNavigate fires on initial
  // mount + every subsequent client-side navigation).
  let watchNextAnchor = $state<HTMLElement | null>(null);
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
    // effect can fire mid-load (history loaded, up-next still pending),
    // skip the scroll because the anchor isn't bound yet, and reveal
    // the page at the top — which is exactly the first-load bug.
    if ($isLoading || $historyLoading) return;

    // Final composition is decided. If we expect to scroll past the
    // history block, the anchor must already exist. If it doesn't yet
    // (DOM hasn't reflected the just-loaded groups), defer one tick;
    // the effect re-runs when watchNextAnchor binds.
    if (historyEntries.length > 0 && groups.length > 0 && !watchNextAnchor) {
      return;
    }

    pendingScroll = false;
    if (watchNextAnchor && historyEntries.length > 0) {
      watchNextAnchor.scrollIntoView({ block: 'start' });
    }
    isReady = true;
  });
</script>

<div class="watchlist-page" class:ready={isReady}>
  {#if ($isLoading || $historyLoading) && $list.length === 0 && historyEntries.length === 0}
    <div class="loading-state">
      <LoadingIndicator />
    </div>
  {:else if groups.length === 0 && historyEntries.length === 0}
    <div class="empty-state">
      <p>{m.text_empty_show_watchlist()}</p>
      <a href="/discover" class="cta-link">{m.cta_explore_shows()}</a>
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

    /* Hide content until autoscroll has landed on the WATCH NEXT divider
       so the user never sees the page render at the top (where history
       sits) before snapping. */
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

  .watch-next-anchor {
    scroll-margin-top: var(--ni-48);
  }
</style>
