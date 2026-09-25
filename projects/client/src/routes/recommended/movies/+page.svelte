<script lang="ts">
  import SeoHead from '$lib/features/seo/SeoHead.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import PosterGrid from '$lib/components/poster-grid/PosterGrid.svelte';
  import LoginGate from '$lib/components/auth/LoginGate.svelte';
  import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
  import RecommendedPosterCard from '$lib/sections/lists/recommended/RecommendedPosterCard.svelte';
  import {
    type RecommendedEntry,
    useRecommendedList,
  } from '$lib/sections/lists/recommended/useRecommendedList.ts';

  const { isAuthorized, login } = useAuth();

  const { list, isLoading, hasNextPage, fetchNextPage } = useRecommendedList({
    type: 'movie',
    limit: 30,
    filter: {},
  });
</script>

<SeoHead title={m.page_title_recommended_movies()} noindex />

{#snippet recommendedCard(media: RecommendedEntry)}
  <RecommendedPosterCard {media} />
{/snippet}

{#if !$isAuthorized}
  <LoginGate {login} />
{:else}
  <PosterGrid
    title="Recommended Movies"
    items={$list}
    isLoading={$isLoading}
    hasNextPage={$hasNextPage}
    {fetchNextPage}
    card={recommendedCard}
  />
{/if}
