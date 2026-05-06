<script lang="ts">
  import BackBar from '$lib/components/back-bar/BackBar.svelte';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import LoadMoreButton from '$lib/components/load-more-button/LoadMoreButton.svelte';
  import type { MovieEntry } from '$lib/requests/models/MovieEntry.ts';
  import type { ShowEntry } from '$lib/requests/models/ShowEntry.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import * as m from '$lib/paraglide/messages.js';
  import PosterCard from '$lib/components/poster-card/PosterCard.svelte';

  type MediaEntry = ShowEntry | MovieEntry;

  type Props = {
    items: MediaEntry[];
    isLoading: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
    title: string;
    backHref?: string;
  };

  const {
    items,
    isLoading,
    hasNextPage,
    fetchNextPage,
    title,
    backHref = '/discover',
  }: Props = $props();

  const getHref = (item: MediaEntry) =>
    item.type === 'show' ? UrlBuilder.show(item.slug) : UrlBuilder.movie(item.slug);
</script>

<div class="grid-page">
  <BackBar href={backHref} label={title} />

  {#if isLoading && items.length === 0}
    <div class="loading-state">
      <LoadingIndicator />
    </div>
  {:else if items.length === 0}
    <div class="empty-state">
      <p>Nothing here yet.</p>
    </div>
  {:else}
    <div class="poster-grid" role="list">
      {#each items as item (item.id)}
        <PosterCard
          type={item.type}
          href={getHref(item)}
          id={item.id}
          title={item.title}
          posterUrl={item.poster.url.thumb}
        />
      {/each}
    </div>

    {#if hasNextPage}
      <LoadMoreButton
        loading={isLoading}
        onclick={fetchNextPage}
        label={m.button_text_load_more()}
      />
    {/if}
  {/if}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .grid-page {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    padding-top: var(--ni-56);
    padding-bottom: var(--trakttime-bottom-nav-height);
  }

  .loading-state,
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
    display: grid;
    grid-template-columns: repeat(
      auto-fill,
      minmax(var(--trakttime-poster-card-width), 1fr)
    );
    gap: var(--gap-s);
    padding: var(--gap-m);
  }

</style>
