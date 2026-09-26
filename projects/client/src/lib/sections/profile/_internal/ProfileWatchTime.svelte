<script lang="ts">
  import { getLocale } from '$lib/features/i18n/index.ts';
  import * as m from '$lib/paraglide/messages.js';
  import type { UserStats } from '$lib/requests/queries/users/userStatsQuery.ts';
  import { toShortWatchTime, toUnitLabelParts } from './toUnitLabelParts.ts';
  import { toWatchTime } from './toWatchTime.ts';

  const { stats }: { stats: UserStats | null } = $props();

  const locale = getLocale();

  const episodeMinutes = $derived(stats?.episodes.minutes ?? 0);
  const movieMinutes = $derived(stats?.movies.minutes ?? 0);
  const totalMinutes = $derived(episodeMinutes + movieMinutes);

  const total = $derived(
    toWatchTime(totalMinutes).map((part) => toUnitLabelParts(part, locale)),
  );
  const episodeShare = $derived(
    totalMinutes === 0 ? 0 : (episodeMinutes / totalMinutes) * 100,
  );
</script>

{#snippet tile(value: number | undefined, label: string)}
  <div class="watch-tile">
    {#if value != null}
      <span class="watch-tile-value">{value.toLocaleString()}</span>
    {:else}
      <span class="watch-skeleton watch-skeleton--tile" aria-hidden="true"></span>
    {/if}
    <span class="watch-tile-label">{label}</span>
  </div>
{/snippet}

<div class="watch-time">
  <div class="watch-card">
    <span class="watch-eyebrow">{m.stat_label_shows_and_movies()}</span>
    {#if stats}
      <div class="watch-total">
        {#each total as part (part.label)}
          <span class="watch-unit"><strong>{part.value}</strong>{part.label}</span>
        {/each}
      </div>
      <div class="watch-split" aria-hidden="true">
        <i class="watch-split-episodes" style:width="{episodeShare}%"></i>
      </div>
      <div class="watch-legend">
        <span>
          <i class="watch-dot watch-dot--episodes"></i>{m.stat_label_episodes()}
          <b>{toShortWatchTime(toWatchTime(episodeMinutes), locale)}</b>
        </span>
        <span>
          <i class="watch-dot watch-dot--movies"></i>{m.page_title_movies()}
          <b>{toShortWatchTime(toWatchTime(movieMinutes), locale)}</b>
        </span>
      </div>
    {:else}
      <span class="watch-skeleton watch-skeleton--total" aria-hidden="true"></span>
      <span class="watch-skeleton watch-skeleton--legend" aria-hidden="true"></span>
    {/if}
  </div>
  <div class="watch-tiles">
    {@render tile(stats?.episodes.plays, m.stat_label_episodes_watched())}
    {@render tile(stats?.movies.watched, m.stat_label_movies_watched())}
    {@render tile(stats?.shows.watched, m.stat_label_shows_watched())}
  </div>
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .watch-time {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    padding: 0 var(--trakttime-page-gutter);

    @include for-tablet-sm-and-up {
      gap: var(--gap-s);
    }
  }

  .watch-card {
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);
    padding: var(--gap-m);
    border-radius: var(--border-radius-xxl);
    border: var(--ni-1) solid color-mix(in srgb, var(--purple-400) 22%, transparent);
    background: radial-gradient(
      120% 140% at 100% 0%,
      color-mix(in srgb, var(--rose-500) 32%, transparent) 0%,
      color-mix(in srgb, var(--purple-500) 26%, transparent) 40%,
      var(--color-card-background) 75%
    );
  }

  .watch-eyebrow {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .watch-total {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--gap-s);
  }

  .watch-unit {
    display: flex;
    align-items: baseline;
    gap: var(--ni-4);
    font-size: 0.8125rem;
    color: var(--color-text-secondary);

    strong {
      font-family: var(--trakttime-font-heading);
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      color: var(--color-text-primary);
    }
  }

  .watch-split {
    height: var(--ni-6);
    border-radius: var(--trakttime-radius-pill);
    overflow: hidden;
    background: var(--blue-500);
  }

  .watch-split-episodes {
    display: block;
    height: 100%;
    background: var(--trakttime-gradient);
  }

  .watch-legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--gap-xs);
    font-size: 0.75rem;
    color: var(--color-text-secondary);

    b {
      margin-inline-start: var(--ni-4);
      font-weight: 600;
      color: var(--color-text-primary);
    }
  }

  .watch-dot {
    display: inline-block;
    width: var(--ni-8);
    height: var(--ni-8);
    border-radius: 50%;
    margin-inline-end: var(--ni-6);

    &--episodes {
      background: var(--rose-500);
    }

    &--movies {
      background: var(--blue-500);
    }
  }

  .watch-tiles {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--gap-xs);

    @include for-tablet-sm-and-up {
      gap: var(--gap-s);
    }
  }

  .watch-tile {
    display: flex;
    flex-direction: column;
    gap: var(--ni-4);
    min-width: 0;
    padding: var(--gap-s);
    border-radius: var(--trakttime-radius-card);
    background: var(--color-card-background);
  }

  .watch-tile-value {
    font-family: var(--trakttime-font-heading);
    font-size: 1.25rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--color-text-primary);
  }

  .watch-tile-label {
    font-size: 0.75rem;
    line-height: 1.3;
    color: var(--color-text-secondary);
  }

  .watch-skeleton {
    display: block;
    border-radius: var(--border-radius-s);
    @include shimmer-bg-elevated;

    &--total {
      width: var(--ni-200);
      height: 2.5rem;
    }

    &--legend {
      width: 100%;
      height: 2rem;
    }

    &--tile {
      width: var(--ni-64);
      height: 1.5rem;
    }
  }

  @include for-tablet-sm-and-up {
    @include for-tablet-lg-and-below {
      .watch-time {
        display: grid;
        grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
      }

      .watch-tiles {
        grid-template-columns: 1fr;
      }
    }
  }
</style>
