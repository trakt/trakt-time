<script lang="ts">
  import {
    readMilestoneBaseline,
    writeMilestoneBaseline,
  } from '$lib/features/delight/_internal/milestoneBaseline.ts';
  import { vibrate } from '$lib/features/delight/_internal/motion.ts';
  import { countUp } from '$lib/features/delight/countUp.ts';
  import {
    findMilestone,
    type Milestone,
    type MilestoneKind,
    milestoneBadge,
  } from '$lib/features/delight/findMilestone.ts';
  import { useDelight } from '$lib/features/delight/useDelight.ts';
  import { getLocale } from '$lib/features/i18n/index.ts';
  import * as m from '$lib/paraglide/messages.js';
  import type { UserStats } from '$lib/requests/queries/users/userStatsQuery.ts';
  import { toShortWatchTime, toUnitLabelParts } from './toUnitLabelParts.ts';
  import { toWatchTime } from './toWatchTime.ts';

  const { stats, isOwner = false }: {
    stats: UserStats | null;
    isOwner?: boolean;
  } = $props();

  const locale = getLocale();

  const episodeMinutes = $derived(stats?.episodes.minutes ?? 0);
  const movieMinutes = $derived(stats?.movies.minutes ?? 0);
  const totalMinutes = $derived(episodeMinutes + movieMinutes);

  const total = $derived(
    toWatchTime(totalMinutes).map((part) => toUnitLabelParts(part, locale)),
  );
  const milestoneDelight = useDelight('milestone');
  const ROLL_DURATION = 1400;

  let milestone: Milestone | null = $state(null);
  let rollingValue: number | null = $state(null);
  let hasCheckedMilestone = false;

  async function celebrateMilestone(found: Milestone) {
    const onceKey = `${found.kind}:${found.threshold}`;
    if (!(await milestoneDelight.claim({ onceKey }))) return;

    milestone = found;
    vibrate(14);
    await countUp({
      from: found.from,
      to: found.to,
      duration: ROLL_DURATION,
      onUpdate: (value) => (rollingValue = value),
    });
    rollingValue = null;
  }

  $effect(() => {
    if (!stats || !isOwner || hasCheckedMilestone) return;
    hasCheckedMilestone = true;

    const after = {
      episodes: stats.episodes.plays,
      movies: stats.movies.watched,
      hours: Math.floor(totalMinutes / 60),
    };
    const before = readMilestoneBaseline();
    writeMilestoneBaseline(after);
    if (!before) return;

    const found = findMilestone({ before, after });
    if (found) celebrateMilestone(found);
  });

  const shown = (kind: MilestoneKind, value: number | undefined) =>
    milestone?.kind === kind && rollingValue !== null ? rollingValue : value;

  const episodeShare = $derived(
    totalMinutes === 0 ? 0 : (episodeMinutes / totalMinutes) * 100,
  );
</script>

{#snippet medal(kind: MilestoneKind)}
  {#if milestone?.kind === kind}
    <span class="watch-medal" aria-label={m.delight_milestone_reached()}>
      {milestoneBadge(milestone.threshold)}
    </span>
  {/if}
{/snippet}

{#snippet tile(value: number | undefined, label: string, kind?: MilestoneKind)}
  <div class="watch-tile">
    {#if kind}
      {@render medal(kind)}
    {/if}
    {#if value != null}
      <span class="watch-tile-value">
        {(kind ? shown(kind, value) : value)?.toLocaleString()}
      </span>
    {:else}
      <span class="watch-skeleton watch-skeleton--tile" aria-hidden="true"></span>
    {/if}
    <span class="watch-tile-label">{label}</span>
  </div>
{/snippet}

<div class="watch-time">
  <div class="watch-card">
    {@render medal('hours')}
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
    {@render tile(stats?.episodes.plays, m.stat_label_episodes_watched(), 'episodes')}
    {@render tile(stats?.movies.watched, m.stat_label_movies_watched(), 'movies')}
    {@render tile(stats?.shows.watched, m.stat_label_shows_watched())}
  </div>
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .watch-medal {
    position: absolute;
    top: calc(var(--ni-12) * -1);
    inset-inline-end: var(--gap-xs);
    display: grid;
    place-items: center;
    width: var(--ni-40);
    height: var(--ni-40);
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, var(--yellow-200), var(--yellow-500));
    box-shadow:
      inset 0 0 0 var(--ni-2) color-mix(in srgb, var(--shade-10) 60%, transparent),
      0 var(--ni-4) var(--ni-12) color-mix(in srgb, var(--yellow-700) 40%, transparent);
    color: var(--yellow-900);
    font-family: var(--trakttime-font-heading);
    font-size: 0.8125rem;
    font-weight: 800;
    animation: medal-drop 620ms cubic-bezier(0.3, 0.7, 0.4, 1) 300ms both;
  }

  @keyframes medal-drop {
    0% {
      opacity: 0;
      transform: translateY(-80px) rotate(-14deg);
    }
    70% {
      opacity: 1;
      transform: translateY(6px) rotate(4deg);
    }
    100% {
      opacity: 1;
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .watch-medal {
      animation: none;
    }
  }

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
    position: relative;
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
    position: relative;
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
