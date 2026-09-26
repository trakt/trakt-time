<script lang="ts" generics="T">
  import GroupHeader from '$lib/components/group-header/GroupHeader.svelte';
  import { languageTag } from '$lib/features/i18n/index.ts';
  import * as m from '$lib/paraglide/messages.js';
  import type { Snippet } from 'svelte';
  import { toUpcomingWeeks, type UpcomingWeek } from './toUpcomingWeeks.ts';
  import {
    toUpcomingDateLabel,
    toUpcomingDayLabel,
    toUpcomingRangeLabel,
    toUpcomingWeekdayLabel,
  } from './upcomingLabels.ts';

  type UpcomingBoardProps = {
    items: ReadonlyArray<T>;
    toDayKey: (item: T) => string;
    getKey: (item: T) => string | number;
    card: Snippet<[T]>;
  };

  const { items, toDayKey, getKey, card }: UpcomingBoardProps = $props();

  const locale = languageTag();
  const today = new Date();

  const weeks = $derived(toUpcomingWeeks({ items, toDayKey, today }));

  function toWeekTitle(week: UpcomingWeek<T>): string {
    if (week.index === 0) return m.header_this_week();
    if (week.index === 1) return m.header_next_week();

    return toUpcomingRangeLabel({
      start: week.days.at(0)?.key ?? '',
      end: week.days.at(-1)?.key ?? '',
      locale,
    });
  }
</script>

<div class="upcoming-board">
  {#each weeks as week (week.index)}
    <section class="upcoming-week">
      <h2 class="upcoming-week-title">{toWeekTitle(week)}</h2>
      <div class="upcoming-week-days">
        {#each week.days as day (day.key)}
          <div
            class="upcoming-day"
            data-empty={day.items.length === 0}
            data-today={day.offset === 0}
          >
            <div class="upcoming-day-group-header">
              <GroupHeader label={toUpcomingDayLabel(day.key, locale, today)} />
            </div>
            <h3 class="upcoming-day-header">
              {toUpcomingWeekdayLabel(day.key, locale, today)}
              <span>{toUpcomingDateLabel(day.key, locale)}</span>
            </h3>
            {#each day.items as item (getKey(item))}
              {@render card(item)}
            {:else}
              <p class="upcoming-day-empty">{m.text_nothing_scheduled()}</p>
            {/each}
          </div>
        {/each}
      </div>
    </section>
  {/each}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .upcoming-board,
  .upcoming-week,
  .upcoming-week-days,
  .upcoming-day,
  .upcoming-day-group-header {
    display: contents;
  }

  .upcoming-week-title,
  .upcoming-day-header,
  .upcoming-day-empty,
  .upcoming-day[data-empty='true'] {
    display: none;
  }

  @include for-tablet-sm-and-up {
    .upcoming-day[data-empty='false'] {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(var(--ni-320), 1fr));
      gap: var(--gap-xs) var(--gap-s);
      padding: 0 var(--trakttime-page-gutter) var(--gap-xs);

      .upcoming-day-group-header {
        display: block;
        grid-column: 1 / -1;
        margin-inline: calc(-1 * var(--trakttime-page-gutter));
      }

      :global(.media-row) {
        margin: 0;
      }
    }
  }

  @include for-desktop {
    .upcoming-board {
      display: flex;
      flex-direction: column;
      gap: var(--gap-xl);
      padding: var(--gap-s) var(--trakttime-page-gutter) 0;
    }

    .upcoming-week {
      display: flex;
      flex-direction: column;
      gap: var(--gap-m);
    }

    .upcoming-week-title {
      display: block;
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .upcoming-week-days {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: var(--gap-s);
    }

    .upcoming-day,
    .upcoming-day[data-empty='true'],
    .upcoming-day[data-empty='false'] {
      display: flex;
      flex-direction: column;
      gap: var(--gap-s);
      padding: 0;
    }

    .upcoming-day .upcoming-day-group-header,
    .upcoming-day[data-empty='false'] .upcoming-day-group-header {
      display: none;
    }

    .upcoming-day-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: var(--gap-xxs);
      margin: 0;
      padding-bottom: var(--gap-xs);
      border-bottom: var(--ni-1) solid var(--color-border);
      font-size: 0.875rem;
      font-weight: 700;

      span {
        font-family: var(--trakttime-font-body);
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--color-text-secondary);
      }
    }

    .upcoming-day[data-today='true'] .upcoming-day-header {
      color: var(--trakttime-accent);
      border-color: var(--trakttime-accent);
    }

    .upcoming-day-empty {
      display: grid;
      place-items: center;
      aspect-ratio: 2 / 3;
      margin: 0;
      padding: var(--gap-s);
      border: var(--ni-1) dashed var(--color-border);
      border-radius: var(--trakttime-radius-card);
      color: var(--color-text-secondary);
      font-size: 0.75rem;
      text-align: center;
    }

    .upcoming-day :global(.media-row) {
      position: relative;
      flex-direction: column;
      align-items: stretch;
      gap: var(--gap-xs);
      margin: 0;
      padding: 0;
      background: none;
      border-radius: 0;
      overflow: visible;
    }

    .upcoming-day :global(.media-row-thumb) {
      width: 100%;
      border-radius: var(--trakttime-radius-card);
      overflow: hidden;
    }

    .upcoming-day :global(.media-row-body) {
      padding: 0;
    }

    .upcoming-day :global(.watched-btn) {
      position: absolute;
      top: var(--gap-xs);
      right: var(--gap-xs);
    }

    .upcoming-day :global(.watched-btn:not(.is-watched, :hover, :focus-visible)) {
      border-color: var(--trakttime-overlay-control-border);
      background: var(--trakttime-overlay-control-background);
      color: var(--trakttime-overlay-text-primary);
    }

    .upcoming-day :global(.media-row-title) {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .upcoming-day :global(.media-row-meta),
    .upcoming-day :global(.media-row-subtitle) {
      font-size: 0.75rem;
    }
  }
</style>
