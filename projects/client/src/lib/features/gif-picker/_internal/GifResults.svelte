<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import { useInfiniteQuery } from '$lib/features/query/useQuery.ts';
  import { gifSearchQuery } from '$lib/requests/queries/gifs/gifSearchQuery.ts';
  import { gifTrendingQuery } from '$lib/requests/queries/gifs/gifTrendingQuery.ts';
  import type { GifEntry } from '$lib/requests/models/GifEntry.ts';
  import { useMedia } from '$lib/stores/css/useMedia.ts';
  import { whenInViewport } from '$lib/utils/actions/whenInViewport.ts';
  import { dedupe } from '$lib/utils/array/dedupe.ts';
  import { firstValueFrom, map } from 'rxjs';
  import { untrack } from 'svelte';
  import { GIF_PAGE_SIZE } from './constants.ts';
  import GifTile from './GifTile.svelte';
  import { toGifColumns } from './toGifColumns.ts';

  const COLUMN_COUNT = 2;

  type Props = {
    customerId: string;
    query: string;
    onSelect: (gif: GifEntry) => void;
  };

  const { customerId, query, onSelect }: Props = $props();

  const results = useInfiniteQuery(
    untrack(() =>
      query
        ? gifSearchQuery({ query, customerId, limit: GIF_PAGE_SIZE })
        : gifTrendingQuery({ customerId, limit: GIF_PAGE_SIZE })
    ),
  );

  const gifs = results.pipe(
    map((state) =>
      dedupe(
        (gif) => gif.id,
        (state.data?.pages ?? []).flatMap((page) => page.entries),
      )
    ),
  );
  const pageCount = results.pipe(map((state) => state.data?.pages.length ?? 0));
  const isLoading = results.pipe(map((state) => state.isLoading));
  const hasNextPage = results.pipe(map((state) => Boolean(state.hasNextPage)));
  const isReducedMotion = useMedia('(prefers-reduced-motion: reduce)');

  const columns = $derived(toGifColumns($gifs, COLUMN_COUNT));

  async function loadMore() {
    const state = await firstValueFrom(results);
    if (!state.hasNextPage || state.isFetchingNextPage) return;

    await state.fetchNextPage();
  }
</script>

{#if $isLoading}
  <div class="gif-grid" aria-hidden="true">
    {#each Array(COLUMN_COUNT) as _, column (column)}
      <div class="gif-column">
        {#each Array(3) as _, row (row)}
          <div class="gif-skeleton" style:--row={row + column}></div>
        {/each}
      </div>
    {/each}
  </div>
{:else if $gifs.length > 0}
  <div class="gif-grid">
    {#each columns as column, index (index)}
      <div class="gif-column">
        {#each column as gif (gif.id)}
          <GifTile
            {gif}
            isReducedMotion={$isReducedMotion}
            onSelect={() => onSelect(gif)}
          />
        {/each}
      </div>
    {/each}
  </div>
  {#if $hasNextPage}
    {#key $pageCount}
      <div class="gif-sentinel" use:whenInViewport={loadMore}></div>
    {/key}
  {/if}
{:else}
  <p class="gif-empty">{m.text_gif_no_results()}</p>
{/if}

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .gif-grid {
    display: flex;
    align-items: flex-start;
    gap: var(--gap-xs);
  }

  .gif-column {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
  }

  .gif-skeleton {
    aspect-ratio: 4 / calc(3 + var(--row) * 1.5);
    border-radius: var(--trakttime-radius-card);
    @include shimmer-bg;
  }

  .gif-sentinel {
    height: var(--ni-2);
  }

  .gif-empty {
    margin: var(--gap-xl) 0 0;
    text-align: center;
    color: var(--color-text-secondary);
  }
</style>
