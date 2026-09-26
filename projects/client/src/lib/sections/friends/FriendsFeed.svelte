<script lang="ts">
  import { page } from '$app/state';
  import { untrack } from 'svelte';
  import GroupHeader from '$lib/components/group-header/GroupHeader.svelte';
  import InfiniteScrollTrigger from '$lib/components/infinite-scroll/InfiniteScrollTrigger.svelte';
  import CtaLink from '$lib/components/link/CtaLink.svelte';
  import { languageTag } from '$lib/features/i18n/index.ts';
  import * as m from '$lib/paraglide/messages.js';
  import { socialActivityQuery } from '$lib/requests/queries/users/socialActivityQuery.ts';
  import { usePaginatedListQuery } from '$lib/sections/lists/stores/usePaginatedListQuery.ts';
  import { toUniqueProfiles } from '$lib/requests/_internal/toUniqueProfiles.ts';
  import { replaceSearchParam } from '$lib/utils/url/replaceSearchParam.ts';
  import { toSearchParamValue } from '$lib/utils/url/toSearchParamValue.ts';
  import FeedItem from './_internal/FeedItem.svelte';
  import FeedItemSkeleton from './_internal/FeedItemSkeleton.svelte';
  import WatchingNowItem from './_internal/WatchingNowItem.svelte';
  import { useWatchingNow } from './_internal/useWatchingNow.ts';
  import { toDayGroups } from './_internal/toDayGroups.ts';
  import { toPastDayLabel } from './_internal/toPastDayLabel.ts';

  const FEED_FILTERS = ['all', 'show', 'movie'] as const;
  type FeedFilter = typeof FEED_FILTERS[number];

  const FEED_PAGE_SIZE = 25;
  const WATCHING_NOW_CANDIDATES = 12;
  const SKELETON_COUNT = 6;

  const { list, isLoading, hasNextPage, fetchNextPage } = usePaginatedListQuery(
    socialActivityQuery({ limit: FEED_PAGE_SIZE }),
  );

  const filter = $derived(
    toSearchParamValue({
      value: page.url.searchParams.get('type'),
      options: FEED_FILTERS,
      fallback: 'all',
    }),
  );
  const setFilter = (value: FeedFilter) =>
    replaceSearchParam({ url: page.url, key: 'type', value });

  const filterOptions = [
    { value: 'all' as const, label: m.text_filter_all() },
    { value: 'show' as const, label: m.page_title_shows() },
    { value: 'movie' as const, label: m.page_title_movies() },
  ];

  const visible = $derived(
    $list.filter((activity) =>
      filter === 'all' || (filter === 'movie') === (activity.type === 'movie')
    ),
  );
  const groups = $derived(toDayGroups(visible));

  const recentlyActive = $derived(
    toUniqueProfiles(
      $list.slice(0, FEED_PAGE_SIZE).flatMap((activity) => activity.users),
    ).slice(0, WATCHING_NOW_CANDIDATES),
  );
  const candidateKey = $derived(
    recentlyActive.map((profile) => profile.key).join(','),
  );
  const watchingNow = $derived.by(() => {
    candidateKey;
    return untrack(() => useWatchingNow(recentlyActive));
  });
  const watching = $derived(watchingNow.watching);
  const watchingLoading = $derived(watchingNow.isLoading);

  const isSettled = $derived(
    !($isLoading && $list.length === 0) && !$watchingLoading,
  );
</script>

<div class="segmented-tabs">
  <h1 class="segmented-tabs-title">{m.page_title_friends()}</h1>
  <div class="segmented-tabs-list" role="group" aria-label={m.page_title_friends()}>
    {#each filterOptions as option (option.value)}
      <button
        type="button"
        class="segmented-tab"
        aria-pressed={filter === option.value}
        data-active={filter === option.value}
        onclick={() => setFilter(option.value)}
      >
        {option.label}
      </button>
    {/each}
  </div>
</div>

{#if !isSettled}
  <div class="friends-skeleton">
    <FeedItemSkeleton count={SKELETON_COUNT} />
  </div>
{:else if $list.length === 0}
  <div class="friends-state">
    <p>{m.text_friends_feed_empty()}</p>
    <CtaLink href="/discover">{m.page_title_discover()}</CtaLink>
  </div>
{:else}
  {#if $watching.length > 0}
    <section class="watching-now">
      <GroupHeader label={m.header_watching_now()} />
      <div class="watching-now-row">
        {#each $watching as { profile, item } (profile.key)}
          <WatchingNowItem {profile} {item} />
        {/each}
      </div>
    </section>
  {/if}

  {#each groups as group (group.dayKey)}
    <section class="friends-day">
      <GroupHeader label={toPastDayLabel(group.dayKey, languageTag())} />
      {#each group.activities as activity (activity.key)}
        <FeedItem {activity} />
      {/each}
    </section>
  {/each}

  <InfiniteScrollTrigger
    hasMore={$hasNextPage}
    isLoading={$isLoading}
    count={visible.length}
    onload={fetchNextPage}
  />
{/if}

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .segmented-tab {
    border: none;
    font-family: inherit;
    cursor: pointer;

    &:not([data-active='true']) {
      background: none;
    }
  }

  .friends-skeleton {
    padding-top: calc(var(--gap-m) + 1.75rem + var(--gap-s));
  }

  .watching-now-row {
    @include scrollable-row;
    gap: var(--gap-m);
    padding: 0 var(--trakttime-page-gutter);
  }

  .friends-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-m);
    padding: var(--gap-xxl) var(--trakttime-page-gutter);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    text-align: center;

    p {
      margin: 0;
    }
  }

  @include for-desktop {
    .friends-day {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));

      > :global(.group-header) {
        grid-column: 1 / -1;
      }
    }
  }
</style>
