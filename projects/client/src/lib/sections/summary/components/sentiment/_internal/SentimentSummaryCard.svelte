<script lang="ts">
  import ChevronRightIcon from '$lib/components/icons/ChevronRightIcon.svelte';
  import SentimentIcon from '$lib/components/icons/SentimentIcon.svelte';
  import SparkleIcon from '$lib/components/icons/SparkleIcon.svelte';
  import RenderFor from '$lib/guards/RenderFor.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { SentimentAnalysis } from '$lib/requests/models/SentimentAnalysis.ts';
  import { mapToSentimentSummary } from './mapToSentimentSummary.ts';

  const MAX_CHIPS_PER_SIDE = 3;

  const {
    sentiment,
    onclick,
  }: {
    sentiment: SentimentAnalysis;
    onclick: () => void;
  } = $props();

  const { pros, cons } = $derived(sentiment.aspect);
  const { text } = $derived(mapToSentimentSummary({ pros, cons }));

  const toChipLabel = (aspect: string) => aspect.replace(/[.!]+$/, '');

  const chips = $derived(
    Array.from({ length: MAX_CHIPS_PER_SIDE }).flatMap((_, i) => [
      ...(pros[i] ? [{ label: toChipLabel(pros[i]), sentiment: 'good' as const }] : []),
      ...(cons[i] ? [{ label: toChipLabel(cons[i]), sentiment: 'bad' as const }] : []),
    ]),
  );

  const positiveShare = $derived(
    pros.length + cons.length > 0
      ? Math.round((pros.length / (pros.length + cons.length)) * 100)
      : 50,
  );
</script>

<button
  type="button"
  class="sentiment-card"
  {onclick}
  aria-label={m.button_label_view_sentiment_analysis()}
>
  <span class="sentiment-card-top">
    <span class="sentiment-verdict">{text}</span>
    <ChevronRightIcon />
  </span>

  <RenderFor audience="vip">
    <span class="sentiment-quote">“{sentiment.highlight || sentiment.analysis}”</span>

    {#snippet fallback()}
      <span class="sentiment-quote sentiment-quote--locked">
        <span class="sentiment-locked-lines" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
        <span class="sentiment-locked-pill">
          <SparkleIcon />
          {m.text_unlock_sentiment_analysis()}
        </span>
      </span>
    {/snippet}
  </RenderFor>

  <span class="sentiment-chips">
    {#each chips as chip, i (`${chip.label}-${i}`)}
      <span class="sentiment-chip" data-sentiment={chip.sentiment}>
        <SentimentIcon sentiment={chip.sentiment} />
        {chip.label}
      </span>
    {/each}
  </span>

  <span
    class="sentiment-balance"
    style:--positive-share="{positiveShare}%"
    aria-hidden="true"
  ></span>
</button>

<style lang="scss">
  .sentiment-card {
    width: 100%;
    height: var(--trakttime-sentiment-card-height);
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);
    padding: var(--gap-m);
    box-sizing: border-box;
    overflow: hidden;
    border: none;
    border-radius: var(--trakttime-radius-card);
    background: var(--background-vip-drawer);
    color: var(--color-text-primary);
    font: inherit;
    text-align: start;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .sentiment-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;

    :global(svg) {
      width: var(--trakttime-icon-md);
      height: var(--trakttime-icon-md);
      color: var(--color-text-secondary);
    }
  }

  .sentiment-verdict {
    padding: var(--ni-2) var(--gap-s);
    border-radius: var(--trakttime-radius-pill);
    background: color-mix(in srgb, var(--trakttime-accent) 18%, transparent);
    color: var(--trakttime-accent);
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .sentiment-quote {
    font-family: var(--trakttime-font-heading);
    font-size: 1.0625rem;
    font-weight: 500;
    line-height: 1.35;
    height: calc(3 * 1.35em);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .sentiment-quote--locked {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .sentiment-locked-lines {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    filter: blur(3px);

    span {
      height: var(--ni-12);
      border-radius: var(--trakttime-radius-pill);
      background: color-mix(in srgb, var(--color-text-primary) 14%, transparent);

      &:nth-child(2) {
        width: 88%;
      }

      &:nth-child(3) {
        width: 56%;
      }
    }
  }

  .sentiment-locked-pill {
    position: absolute;
    inset: 0;
    margin: auto;
    width: fit-content;
    height: fit-content;
    display: inline-flex;
    align-items: center;
    gap: var(--gap-xxs);
    padding: var(--gap-xxs) var(--gap-s);
    border-radius: var(--trakttime-radius-pill);
    background: var(--trakttime-gradient);
    color: var(--trakttime-accent-foreground);
    font-family: var(--trakttime-font-body);
    font-size: 0.8125rem;
    font-weight: 600;

    :global(svg) {
      width: var(--ni-14);
      height: var(--ni-14);
    }
  }

  .sentiment-chips {
    display: flex;
    gap: var(--gap-xs);
    overflow: hidden;
    mask-image: linear-gradient(to right, black 85%, transparent);
  }

  .sentiment-chip {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: var(--ni-4);
    height: var(--ni-28);
    padding: 0 var(--gap-s);
    border-radius: var(--trakttime-radius-pill);
    background: var(--color-floating-background);
    font-size: 0.8125rem;
    white-space: nowrap;

    :global(svg) {
      width: var(--ni-14);
      height: var(--ni-14);
    }

    &[data-sentiment='good'] :global(svg) {
      color: var(--color-sentiment-good);
    }

    &[data-sentiment='bad'] :global(svg) {
      color: var(--color-sentiment-bad);
    }
  }

  .sentiment-balance {
    height: var(--ni-4);
    border-radius: var(--trakttime-radius-pill);
    background: linear-gradient(
      to right,
      var(--color-sentiment-good) var(--positive-share),
      var(--color-sentiment-bad) var(--positive-share)
    );
  }
</style>
