<script lang="ts">
  import StarIcon from '$lib/components/icons/StarIcon.svelte';
  import { languageTag } from '$lib/features/i18n/index.ts';
  import * as m from '$lib/paraglide/messages.js';
  import type { ExtendedMediaType } from '$lib/requests/models/ExtendedMediaType.ts';
  import { formatStars, STAR_COUNT, toStarsFromUserRating } from '$lib/utils/rating/toStars.ts';
  import { RatingGroup } from 'bits-ui';
  import { useRatings } from './useRatings.ts';

  type Props = {
    type: ExtendedMediaType;
    id: number;
    isLocked: boolean;
  };

  const { type, id, isLocked }: Props = $props();

  const { pendingRating, isSubmitting, current, addRating, removeRating } =
    $derived(useRatings({ type, id }));

  const userRating = $derived($pendingRating ?? $current?.rating ?? 0);
  const stars = $derived(toStarsFromUserRating(userRating));
  const tally = $derived(
    userRating > 0
      ? `${formatStars({ value: stars, locale: languageTag() })} / ${STAR_COUNT}`
      : null,
  );

  function onRatingChange(value: number) {
    if (value === 0) {
      removeRating();
      return;
    }

    addRating(value * 2);
  }
</script>

<div class="rate-stars">
  <div class="rate-stars-heading">
    <span class="rate-stars-label">{m.header_rate_now()}</span>
    {#if tally}
      <span class="rate-stars-tally">{tally}</span>
    {:else if isLocked}
      <span class="rate-stars-hint">{m.text_rate_after_watching()}</span>
    {/if}
  </div>
  <RatingGroup.Root
    class="rate-stars-row"
    value={stars}
    onValueChange={onRatingChange}
    allowHalf
    max={STAR_COUNT}
    disabled={$isSubmitting || isLocked}
  >
    {#snippet children({ items })}
      {#each items as item (item.index)}
        <RatingGroup.Item index={item.index} class="rate-star">
          <StarIcon
            fill={item.state === 'active'
              ? 'full'
              : item.state === 'partial'
              ? 'half'
              : 'none'}
          />
        </RatingGroup.Item>
      {/each}
    {/snippet}
  </RatingGroup.Root>
</div>

<style lang="scss">
  .rate-stars {
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);
  }

  .rate-stars-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--gap-s);
  }

  .rate-stars-label {
    font-family: var(--trakttime-font-heading);
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .rate-stars-tally {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--trakttime-accent);
    font-variant-numeric: tabular-nums;
  }

  .rate-stars-hint {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  /* bits-ui renders the rating items as divs and marks disabled with data-disabled. */
  :global(.rate-stars-row) {
    display: flex;
    gap: var(--gap-xs);
    align-items: center;
  }

  :global(.rate-stars-row svg) {
    width: var(--ni-32);
    height: var(--ni-32);
    color: var(--trakttime-accent);
    transition: color 0.15s ease;
  }

  :global(.rate-stars-row[data-disabled]) {
    opacity: 0.4;
  }

  :global(.rate-stars-row[data-disabled] svg) {
    color: color-mix(in srgb, var(--color-text-secondary) 70%, transparent);
  }

  :global(.rate-star) {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: transform 0.1s ease;
  }

  :global(.rate-star[data-disabled]) {
    cursor: not-allowed;
  }

  :global(.rate-star:active:not([data-disabled])) {
    transform: scale(0.9);
  }
</style>
