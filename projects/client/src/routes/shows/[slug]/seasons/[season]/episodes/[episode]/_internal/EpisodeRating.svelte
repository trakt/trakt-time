<script lang="ts">
  import type { MarkAsWatchedStoreProps } from '$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts';
  import { useIsWatched } from '$lib/sections/media-actions/mark-as-watched/useIsWatched.ts';
  import RateStars from '$lib/sections/summary/components/rating/RateStars.svelte';

  type Props = {
    id: number;
    watchedProps: MarkAsWatchedStoreProps;
  };

  const { id, watchedProps }: Props = $props();

  const { isWatched } = $derived(useIsWatched(watchedProps));
</script>

<section class="episode-rating">
  <RateStars type="episode" {id} isLocked={!$isWatched} />
</section>

<style lang="scss">
  .episode-rating {
    padding: var(--gap-m);
    border-radius: var(--trakttime-radius-card);
    background: var(--color-card-background);
  }
</style>
