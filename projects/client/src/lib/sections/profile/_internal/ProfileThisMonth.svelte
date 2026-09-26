<script lang="ts">
  import { getLocale } from '$lib/features/i18n/index.ts';
  import * as m from '$lib/paraglide/messages.js';
  import type { Snippet } from 'svelte';
  import type { MonthStats } from './toWatchStats.ts';
  import { toShortWatchTime } from './toUnitLabelParts.ts';
  import { toWatchTime } from './toWatchTime.ts';

  type Props = {
    month: (MonthStats & { ratings: number | null }) | null;
    footer?: Snippet;
  };

  const { month, footer }: Props = $props();

  const locale = getLocale();
</script>

{#snippet cell(value: string | undefined, label: string)}
  <div class="month-cell">
    {#if value != null}
      <span class="month-value">{value}</span>
    {:else}
      <span class="month-skeleton" aria-hidden="true"></span>
    {/if}
    <span class="month-label">{label}</span>
  </div>
{/snippet}

<div class="month-card">
  <div class="month-cells" class:has-ratings={month?.ratings != null}>
    {@render cell(month?.plays.toLocaleString(locale), m.label_stats_plays())}
    {@render cell(
      month ? toShortWatchTime(toWatchTime(month.minutes), locale) || '0' : undefined,
      m.tag_text_watched(),
    )}
    {#if month?.ratings != null}
      {@render cell(month.ratings.toLocaleString(locale), m.label_stats_ratings())}
    {/if}
  </div>
  {#if footer}
    <div class="month-footer">{@render footer()}</div>
  {/if}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .month-card {
    margin: 0 var(--trakttime-page-gutter);
    border-radius: var(--border-radius-xl);
    background: var(--color-card-background);
    overflow: hidden;
  }

  .month-cells {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--gap-xs);
    padding: var(--gap-m);

    &.has-ratings {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  .month-cell {
    display: flex;
    flex-direction: column;
    gap: var(--ni-2);
    min-width: 0;
  }

  .month-value {
    font-family: var(--trakttime-font-heading);
    font-size: 1.625rem;
    font-weight: 700;
    line-height: 1.15;
    color: var(--color-text-primary);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .month-skeleton {
    width: var(--ni-56);
    height: 1.875rem;
    border-radius: var(--border-radius-s);
    @include shimmer-bg-elevated;
  }

  .month-label {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .month-footer {
    border-top: var(--ni-1) solid var(--color-border);
  }
</style>
