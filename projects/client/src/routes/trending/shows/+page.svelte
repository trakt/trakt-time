<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import PosterGrid from '$lib/components/poster-grid/PosterGrid.svelte';
  import { useTrendingList } from '$lib/sections/lists/trending/useTrendingList.ts';

  const { list, isLoading, hasNextPage, fetchNextPage } = useTrendingList({
    type: 'show',
    limit: 30,
    filter: {},
  });
</script>

<svelte:head>
  <title>{m.page_title_trending_shows()} - Trakt Time</title>
</svelte:head>

<PosterGrid
  title="Trending Shows"
  items={$list}
  isLoading={$isLoading}
  hasNextPage={$hasNextPage}
  {fetchNextPage}
/>
