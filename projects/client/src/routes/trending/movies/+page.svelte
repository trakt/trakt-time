<script lang="ts">
  import SeoHead from '$lib/features/seo/SeoHead.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import PosterGrid from '$lib/components/poster-grid/PosterGrid.svelte';
  import { useTrendingList } from '$lib/sections/lists/trending/useTrendingList.ts';

  const { list, isLoading, hasNextPage, fetchNextPage } = useTrendingList({
    type: 'movie',
    limit: 30,
    filter: {},
  });
</script>

<SeoHead title={m.page_title_trending_movies()} />

<PosterGrid
  title="Trending Movies"
  items={$list}
  isLoading={$isLoading}
  hasNextPage={$hasNextPage}
  {fetchNextPage}
/>
