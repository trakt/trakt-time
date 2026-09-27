<script lang="ts">
  import StarIcon from '$lib/components/icons/StarIcon.svelte';
  import { celebrate } from '$lib/features/delight/celebrate.ts';
  import { ratingDelight } from '$lib/features/delight/delightRules.ts';
  import PopcornBurst from '$lib/features/delight/effects/PopcornBurst.svelte';
  import RainCloud from '$lib/features/delight/effects/RainCloud.svelte';
  import RottenTomato from '$lib/features/delight/effects/RottenTomato.svelte';
  import { useDelight } from '$lib/features/delight/useDelight.ts';
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

  const highDelight = useDelight('rating-high');
  const lowDelight = useDelight('rating-low');
  const SOGGY_DURATION = 1900;

  let root: HTMLElement | null = $state(null);
  let isSoggy = $state(false);

  function starAt(value: number) {
    return root?.querySelector(
      `[data-rating-group-item][data-value="${Math.ceil(value)}"]`,
    );
  }

  async function playHigh(star: Element) {
    if (!(await highDelight.claim())) return;
    celebrate({ effect: PopcornBurst, at: star });
  }

  async function playLow(star: Element) {
    const variant = await lowDelight.claim({ variants: ['tomato', 'rain'] });
    if (!variant) return;

    if (variant === 'tomato') {
      celebrate({ effect: RottenTomato, at: star, haptic: [10, 40, 10] });
      return;
    }

    celebrate({ effect: RainCloud, at: star });
    isSoggy = true;
    setTimeout(() => (isSoggy = false), SOGGY_DURATION);
  }

  function delight(value: number) {
    const rating = value * 2;
    const kind = ratingDelight(rating);
    const star = starAt(value);
    if (!kind || !star) return;

    if (kind === 'rating-high') playHigh(star);
    if (kind === 'rating-low') playLow(star);
  }

  function onRatingChange(value: number) {
    if (value === 0) {
      removeRating();
      return;
    }

    addRating(value * 2);
    delight(value);
  }
</script>

<div class="rate-stars" class:is-soggy={isSoggy} bind:this={root}>
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
    transition:
      color 0.15s ease,
      filter var(--transition-duration-short) ease,
      opacity var(--transition-duration-short) ease;
  }

  .is-soggy :global(.rate-stars-row svg) {
    filter: grayscale(1);
    opacity: 0.5;
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
