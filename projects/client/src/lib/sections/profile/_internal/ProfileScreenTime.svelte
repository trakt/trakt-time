<script lang="ts">
  import FlameIcon from '$lib/components/icons/FlameIcon.svelte';
  import { getLocale } from '$lib/features/i18n/index.ts';
  import * as m from '$lib/paraglide/messages.js';
  import { capitalizeFirst } from '$lib/utils/string/capitalizeFirst.ts';
  import type { ScreenTime } from './toWatchStats.ts';
  import { toShortWatchTime } from './toUnitLabelParts.ts';
  import { toWatchTime } from './toWatchTime.ts';

  const { screenTime }: { screenTime: ScreenTime } = $props();

  const locale = getLocale();

  const toDuration = (minutes: number) =>
    toShortWatchTime(toWatchTime(minutes), locale) || '0';

  const peak = $derived(Math.max(...screenTime.dailyMinutes, 1));
  const lastDayIndex = $derived(screenTime.dailyMinutes.length - 1);

  const dayLabels = $derived(
    screenTime.dailyMinutes.map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (lastDayIndex - index));
      return capitalizeFirst(
        new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(date),
        locale,
      );
    }),
  );
</script>

<div class="screen-card">
  {#if screenTime.totalMinutes === 0}
    <p class="screen-empty">{m.text_stats_no_screen_time()}</p>
  {:else}
    <div class="screen-total">
      <span class="screen-total-value">{toDuration(screenTime.totalMinutes)}</span>
      <span class="screen-total-previous">
        {m.text_last_week_total({ value: toDuration(screenTime.previousMinutes) })}
      </span>
    </div>

    <div class="screen-bars" aria-hidden="true">
      {#each screenTime.dailyMinutes as minutes, index (index)}
        <span class="screen-bar-column">
          <span
            class="screen-bar"
            class:is-today={index === lastDayIndex}
            style:height="{Math.max((minutes / peak) * 100, 4)}%"
          ></span>
          <span class="screen-bar-label" class:is-today={index === lastDayIndex}>
            {dayLabels[index]}
          </span>
        </span>
      {/each}
    </div>
  {/if}

  <div class="screen-streak">
    <FlameIcon />
    <strong>{screenTime.streak}</strong>
    <span>{m.label_stats_current_streak()}</span>
  </div>
</div>

<style lang="scss">
  .screen-card {
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
    margin: 0 var(--trakttime-page-gutter);
    padding: var(--gap-m);
    border-radius: var(--border-radius-xl);
    background: var(--color-card-background);
  }

  .screen-empty {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }

  .screen-total {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--gap-xs);
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
