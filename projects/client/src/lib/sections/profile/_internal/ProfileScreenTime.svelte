<script lang="ts">
  import FlameIcon from '$lib/components/icons/FlameIcon.svelte';
  import { getLocale } from '$lib/features/i18n/index.ts';
  import * as m from '$lib/paraglide/messages.js';
  import { capitalizeFirst } from '$lib/utils/string/capitalizeFirst.ts';
  import type { ScreenTime } from './toWatchStats.ts';
  import { toShortWatchTime } from './toUnitLabelParts.ts';
  import { toWatchTime } from './toWatchTime.ts';

  const { screenTime }: { screenTime: ScreenTime | null } = $props();

  const SKELETON_BAR_HEIGHTS = [30, 55, 20, 70, 45, 90, 60];

  const locale = getLocale();

  const toDuration = (minutes: number) =>
    toShortWatchTime(toWatchTime(minutes), locale) || '0';

  const dailyMinutes = $derived(
    screenTime?.dailyMinutes ?? SKELETON_BAR_HEIGHTS.map(() => 0),
  );
  const peak = $derived(Math.max(...dailyMinutes, 1));
  const lastDayIndex = $derived(dailyMinutes.length - 1);

  const toBarHeight = (minutes: number, index: number) =>
    screenTime
      ? Math.max((minutes / peak) * 100, 4)
      : SKELETON_BAR_HEIGHTS[index] ?? 0;

  const dayLabels = $derived(
    dailyMinutes.map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (lastDayIndex - index));
      return capitalizeFirst(
        new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(date),
        locale,
      );
    }),
  );
</script>

<div class="screen-card" aria-busy={screenTime == null}>
  <div class="screen-total">
    {#if !screenTime}
      <span class="screen-skeleton screen-skeleton--total" aria-hidden="true"></span>
    {:else if screenTime.totalMinutes === 0}
      <span class="screen-total-previous">{m.text_stats_no_screen_time()}</span>
    {:else}
      <span class="screen-total-value">{toDuration(screenTime.totalMinutes)}</span>
      <span class="screen-total-previous">
        {m.text_last_week_total({ value: toDuration(screenTime.previousMinutes) })}
      </span>
    {/if}
  </div>

  <div class="screen-bars" class:is-loading={!screenTime} aria-hidden="true">
    {#each dailyMinutes as minutes, index (index)}
      <span class="screen-bar-column">
        <span
          class="screen-bar"
          class:is-today={screenTime != null && index === lastDayIndex}
          style:height="{toBarHeight(minutes, index)}%"
        ></span>
        <span class="screen-bar-label" class:is-today={index === lastDayIndex}>
          {dayLabels[index]}
        </span>
      </span>
    {/each}
  </div>

  <div class="screen-streak">
    <FlameIcon />
    {#if screenTime}
      <strong>{screenTime.streak}</strong>
    {:else}
      <span class="screen-skeleton screen-skeleton--streak" aria-hidden="true"></span>
    {/if}
    <span>{m.label_stats_current_streak()}</span>
  </div>
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .screen-card {
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
    margin: 0 var(--trakttime-page-gutter);
    padding: var(--gap-m);
    border-radius: var(--border-radius-xl);
    background: var(--color-card-background);
  }

  .screen-total {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--gap-xs);
    min-height: 2.2rem;
  }

  .screen-skeleton {
    display: inline-block;
    border-radius: var(--border-radius-s);
    @include shimmer-bg-elevated;
  }

  .screen-skeleton--total {
    width: var(--ni-120);
    height: 2.2rem;
  }

  .screen-skeleton--streak {
    width: var(--ni-16);
    height: 1.25rem;
  }

  .screen-bars.is-loading .screen-bar {
    @include shimmer-bg-elevated;
  }

  .screen-total-value {
    font-family: var(--trakttime-font-heading);
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.1;
    color: var(--color-text-primary);
  }

  .screen-total-previous {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .screen-bars {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: var(--gap-xs);
    height: var(--ni-120);
  }

  .screen-bar-column {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: stretch;
    gap: var(--gap-xxs);
    min-height: 0;
  }

  .screen-bar {
    border-radius: var(--border-radius-s);
    background: var(--color-border);

    &.is-today {
      background: var(--trakttime-gradient);
    }
  }

  .screen-bar-label {
    font-size: 0.6875rem;
    text-align: center;
    color: var(--color-text-secondary);

    &.is-today {
      color: var(--color-text-primary);
      font-weight: 600;
    }
  }

  .screen-streak {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
    padding-top: var(--gap-s);
    border-top: var(--ni-1) solid var(--color-border);
    font-size: 0.8125rem;
    color: var(--color-text-secondary);

    :global(svg) {
      width: var(--ni-18);
      height: var(--ni-18);
      color: var(--rose-400);
    }

    strong {
      font-family: var(--trakttime-font-heading);
      font-size: 1rem;
      color: var(--color-text-primary);
    }
  }
</style>
