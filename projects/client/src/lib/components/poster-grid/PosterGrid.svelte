<script lang="ts" generics="T extends ShowEntry | MovieEntry">
  import BackBar from '$lib/components/back-bar/BackBar.svelte';
  import InfiniteScrollTrigger from '$lib/components/infinite-scroll/InfiniteScrollTrigger.svelte';
  import PosterSkeleton from '$lib/components/poster-card/PosterSkeleton.svelte';
  import type { MovieEntry } from '$lib/requests/models/MovieEntry.ts';
  import type { ShowEntry } from '$lib/requests/models/ShowEntry.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import * as m from '$lib/paraglide/messages.js';
  import PosterCard from '$lib/components/poster-card/PosterCard.svelte';
  import type { Snippet } from 'svelte';

  type MediaEntry = ShowEntry | MovieEntry;

  type Props = {
    items: T[];
    isLoading: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
    title: string;
    backHref?: string;
    card?: Snippet<[T]>;
  };

  const {
    items,
    isLoading,
    hasNextPage,
    fetchNextPage,
    title,
    backHref = '/discover',
    card,
  }: Props = $props();

  const getHref = (item: MediaEntry) =>
    item.type === 'show' ? UrlBuilder.show(item.slug) : UrlBuilder.movie(item.slug);

  const SKELETON_COUNT = 12;
</script>

<div class="grid-page">
  <BackBar href={backHref} label={title} />

  {#if isLoading && items.length === 0}
    <div class="poster-grid" aria-hidden="true">
      {#each Array(SKELETON_COUNT) as _, i (`gs-${i}`)}
        <PosterSkeleton />
      {/each}
    </div>
  {:else if items.length === 0}
    <div class="empty-state">
      <p>Nothing here yet.</p>
    </div>
  {:else}
    <div class="poster-grid" role="list">
      {#each items as item (item.id)}
        {#if card}
          {@render card(item)}
        {:else}
          <PosterCard
            type={item.type}
            href={getHref(item)}
            id={item.id}
            title={item.title}
            posterUrl={item.poster.url.thumb}
          />
        {/if}
      {/each}
    </div>

    <InfiniteScrollTrigger
      hasMore={hasNextPage}
      isLoading={isLoading}
      count={items.length}
      onload={fetchNextPage}
    />
  {/if}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .grid-page {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    padding-top: var(--ni-72);
    padding-bottom: var(--trakttime-bottom-nav-height);
  }

  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--gap-xxl) var(--gap-m);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }

  .poster-grid {
    padding: var(--gap-m);
  }

</style>
