<script lang="ts">
  import StarIcon from '$lib/components/icons/StarIcon.svelte';
  import { STAR_COUNT } from '$lib/utils/rating/toStars.ts';

  const { value }: { value: number } = $props();

  const halves = $derived(Math.round(value * 2));

  function toFill(index: number) {
    const remaining = halves - index * 2;
    if (remaining >= 2) return 'full';
    if (remaining === 1) return 'half';
    return 'none';
  }
</script>

<span class="star-rating" aria-hidden="true">
  {#each Array(STAR_COUNT) as _, index (index)}
    <StarIcon fill={toFill(index)} />
  {/each}
</span>

<style lang="scss">
  .star-rating {
    display: inline-flex;
    align-items: center;
    gap: var(--ni-1);
    color: var(--trakttime-accent);

    :global(svg) {
      width: var(--star-rating-size, var(--ni-14));
      height: var(--star-rating-size, var(--ni-14));
    }
  }
</style>
