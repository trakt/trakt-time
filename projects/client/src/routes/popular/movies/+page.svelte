<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import PosterGrid from '$lib/components/poster-grid/PosterGrid.svelte';
  import { usePopularList } from '$lib/sections/lists/popular/usePopularList.ts';

  const { list, isLoading, hasNextPage, fetchNextPage } = usePopularList({
    type: 'movie',
    limit: 30,
    filter: {},
  });
</script>

<svelte:head>
  <title>{m.page_title_popular_movies()} - Trakt Time</title>
</svelte:head>

<PosterGrid
  title="Popular Movies"
  items={$list}
  isLoading={$isLoading}
  hasNextPage={$hasNextPage}
  {fetchNextPage}
/>
