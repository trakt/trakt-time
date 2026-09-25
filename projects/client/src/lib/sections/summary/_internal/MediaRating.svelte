<script lang="ts">
  import StarRating from '$lib/components/rating/StarRating.svelte';
  import { languageTag } from '$lib/features/i18n/index.ts';
  import * as m from '$lib/paraglide/messages.js';
  import { formatStars, toStarsFromScore } from '$lib/utils/rating/toStars.ts';

  type Props = {
    score: number;
    extraLabel?: string | null;
  };

  const { score, extraLabel }: Props = $props();

  const stars = $derived(toStarsFromScore(score));
  const label = $derived(formatStars({ value: stars, locale: languageTag() }));
</script>

<div class="summary-rating">
  <span class="summary-rating-value" aria-label={m.text_star_rating_label({ rating: label })}>
    {label}
  </span>
  <StarRating value={stars} />
  {#if extraLabel}
    <span class="summary-rating-extra">{extraLabel}</span>
  {/if}
</div>

<style lang="scss">
  .summary-rating {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--trakttime-accent);
  }

  .summary-rating-value {
    font-variant-numeric: tabular-nums;
  }

  .summary-rating-extra {
    font-weight: 500;
    color: var(--color-text-secondary);
    margin-left: var(--gap-xs);
  }
</style>
