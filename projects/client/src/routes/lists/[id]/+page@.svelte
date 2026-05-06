<script lang="ts">
  import { page } from '$app/state';
  import BackBar from '$lib/components/back-bar/BackBar.svelte';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import LoadMoreButton from '$lib/components/load-more-button/LoadMoreButton.svelte';
  import { userListItemsQuery } from '$lib/requests/queries/users/userListItemsQuery.ts';
  import { usePaginatedListQuery } from '$lib/sections/lists/stores/usePaginatedListQuery.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import PosterCard from '$lib/components/poster-card/PosterCard.svelte';
  import * as m from '$lib/paraglide/messages.js';

  const listId = page.params.id ?? '';
  const listName = $derived(page.url.searchParams.get('name') ?? 'List');

  const { list, isLoading, hasNextPage, fetchNextPage } = usePaginatedListQuery(
    userListItemsQuery({ userId: 'me', listId, limit: 20 }),
  );

  const items = $derived(
    $list.filter((item) => item.type === 'show' || item.type === 'movie'),
  );
</script>

<svelte:head>
  <title>{listName} - Trakt Time</title>
</svelte:head>

<div class="list-page">
  <BackBar href="/profile" label={listName} />

  <div class="list-content">
    {#if $isLoading && items.length === 0}
      <div class="loading-state">
        <LoadingIndicator />
      </div>
    {:else if items.length > 0}
      <div class="poster-grid" role="list">
        {#each items as item (item.key)}
          {#if item.type === 'show'}
            <PosterCard
              type="show"
              href={UrlBuilder.show(item.entry.slug)}
              id={item.entry.id}
              title={item.entry.title}
              posterUrl={item.entry.poster.url.thumb}
            />
          {:else if item.type === 'movie'}
            <PosterCard
              type="movie"
              href={UrlBuilder.movie(item.entry.slug)}
              id={item.entry.id}
              title={item.entry.title}
              posterUrl={item.entry.poster.url.thumb}
            />
          {/if}
        {/each}
      </div>

      {#if $hasNextPage}
        <LoadMoreButton
          loading={$isLoading}
          onclick={fetchNextPage}
          label={m.button_text_load_more()}
        />
      {/if}
    {:else if !$isLoading}
      <div class="empty-state">
        <p>{m.text_empty_list()}</p>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .list-page {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    background: var(--color-background);
    padding-top: var(--ni-56);
    padding-bottom: var(--trakttime-bottom-nav-height);
  }

  .list-content {
    padding: var(--gap-m);
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
  }

  .poster-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--trakttime-poster-card-width), 1fr));
    gap: var(--gap-s);
  }

  .loading-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: var(--trakttime-loading-top);
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--gap-xxl) var(--gap-m);
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    text-align: center;
  }

</style>
