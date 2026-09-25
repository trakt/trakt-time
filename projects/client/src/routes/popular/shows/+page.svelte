<script lang="ts">
  import SeoHead from '$lib/features/seo/SeoHead.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import PosterGrid from '$lib/components/poster-grid/PosterGrid.svelte';
  import { usePopularList } from '$lib/sections/lists/popular/usePopularList.ts';

  const { list, isLoading, hasNextPage, fetchNextPage } = usePopularList({
    type: 'show',
    limit: 30,
    filter: {},
  });
</script>

<SeoHead title={m.page_title_popular_shows()} />

<PosterGrid
  title="Popular Shows"
  items={$list}
  isLoading={$isLoading}
  hasNextPage={$hasNextPage}
  {fetchNextPage}
/>
