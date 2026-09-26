<script lang="ts">
  import { page } from '$app/state';
  import { replaceSearchParam } from '$lib/utils/url/replaceSearchParam.ts';
  import { toSearchParamValue } from '$lib/utils/url/toSearchParamValue.ts';
  import SegmentedControl from '$lib/components/segmented-control/SegmentedControl.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { ProgressEntry } from '$lib/requests/models/ProgressEntry.ts';
  import { progressWatchedQuery } from '$lib/requests/queries/sync/progressWatchedQuery.ts';
  import { droppedShowsQuery } from '$lib/requests/queries/users/droppedShowsQuery.ts';
  import { usePaginatedListQuery } from '$lib/sections/lists/stores/usePaginatedListQuery.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import ProfileListRow from './ProfileListRow.svelte';
  import { PROGRESS_TABS, toProgressBucket } from './toProgressBucket.ts';

  const PREVIEW_COUNT = 3;
  const COMPLETED_PAGE_SIZE = 20;

  const tab = $derived(
    toSearchParamValue({
      value: page.url.searchParams.get('progress'),
      options: PROGRESS_TABS,
      fallback: 'in-progress',
    }),
  );

  const watching = usePaginatedListQuery(
    progressWatchedQuery({ limit: PREVIEW_COUNT, intent: 'continue' }),
  ).list;
  const completed = usePaginatedListQuery(
    progressWatchedQuery({ limit: COMPLETED_PAGE_SIZE, intent: 'completed' }),
  ).list;
  const dropped = usePaginatedListQuery(
    droppedShowsQuery({ limit: PREVIEW_COUNT }),
  ).list;

  const options = [
    { value: 'in-progress' as const, label: m.button_text_progress_in_progress() },
    { value: 'completed' as const, label: m.button_text_progress_completed() },
    { value: 'ended' as const, label: m.button_text_progress_ended() },
    { value: 'dropped' as const, label: m.button_text_progress_dropped() },
  ];

  const entries = $derived(
    toProgressBucket({
      tab,
      watching: $watching,
      completed: $completed,
      dropped: $dropped,
    }).slice(0, PREVIEW_COUNT),
  );

  const toShare = (entry: ProgressEntry) =>
    entry.type === 'watched' && entry.total > 0
      ? (entry.completed / entry.total) * 100
      : null;
</script>

<div class="progress-toggle">
  <SegmentedControl
    label={m.list_title_progress()}
    value={tab}
    {options}
    onChange={(value) =>
      replaceSearchParam({ url: page.url, key: 'progress', value })}
  />
</div>

{#if entries.length === 0}
  <p class="progress-empty">{m.text_no_activity()}</p>
{:else}
  <div class="progress-card">
    {#each entries as entry (entry.key)}
      {@const share = toShare(entry)}
      <ProfileListRow
        href={UrlBuilder.show(entry.show.slug)}
        posterUrl={entry.show.poster.url.thumb}
        title={entry.show.title}
      >
        {#snippet trailing()}
          {#if entry.type === 'watched'}
            <span class="progress-count">{entry.completed} / {entry.total}</span>
          {/if}
        {/snippet}
        {#snippet footer()}
          {#if share != null}
            <span class="progress-bar" aria-hidden="true">
              <i style:width="{share}%"></i>
            </span>
          {/if}
        {/snippet}
      </ProfileListRow>
    {/each}
  </div>
{/if}

<style lang="scss">
  .progress-toggle {
    padding: 0 var(--trakttime-page-gutter) var(--gap-s);
    overflow-x: auto;
    scrollbar-width: none;
  }

  .progress-card {
    display: flex;
    flex-direction: column;
    margin: 0 var(--trakttime-page-gutter);
    border-radius: var(--border-radius-xl);
    background: var(--color-card-background);
    overflow: hidden;

    > :global(* + *) {
      border-top: var(--ni-1) solid var(--color-border);
    }
  }

  .progress-empty {
    margin: 0;
    padding: var(--gap-l) var(--trakttime-page-gutter);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    text-align: center;
  }

  .progress-count {
    flex-shrink: 0;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    font-variant-numeric: tabular-nums;
  }

  .progress-bar {
    display: block;
    height: var(--ni-6);
    border-radius: var(--trakttime-radius-pill);
    background: var(--color-border);
    overflow: hidden;

    i {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: var(--trakttime-gradient);
    }
  }
</style>
