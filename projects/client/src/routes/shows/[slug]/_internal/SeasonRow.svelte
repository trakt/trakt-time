<script lang="ts">
  import TrackIcon from '$lib/components/icons/TrackIcon.svelte';
  import { announceCaughtUp } from '$lib/features/delight/caughtUp.ts';
  import { animate, vibrate } from '$lib/features/delight/_internal/motion.ts';
  import { useDelight } from '$lib/features/delight/useDelight.ts';
  import RenderFor from '$lib/guards/RenderFor.svelte';
  import type { Season } from '$lib/requests/models/Season.ts';
  import { useSeasonWatched } from '$lib/sections/media-actions/mark-as-watched/season/useSeasonWatched.ts';
  import { seasonLabel } from '$lib/utils/intl/seasonLabel.ts';
  import * as m from '$lib/paraglide/messages.js';
  import SeasonEpisodes from './SeasonEpisodes.svelte';

  type Props = {
    slug: string;
    season: Season;
    seasons: ReadonlyArray<Season>;
    showId: number;
    showTitle: string;
    isOpen: boolean;
    onToggle: () => void;
    hasEnded: boolean;
  };
  const {
    slug,
    season,
    seasons,
    showId,
    showTitle,
    isOpen,
    onToggle,
    hasEnded,
  }: Props = $props();

  const seasonDelight = useDelight('season-complete');
  const caughtUpDelight = useDelight('caught-up');
  const STAMP_DURATION = 2600;

  let row: HTMLElement | null = $state(null);
  let isStamped = $state(false);

  async function stampComplete() {
    if (!(await seasonDelight.claim())) return;

    isStamped = true;
    vibrate(14);
    setTimeout(() => (isStamped = false), STAMP_DURATION);
    if (row) {
      animate(
        row,
        [{ transform: 'none' }, { transform: 'translateY(2px)' }, { transform: 'none' }],
        { duration: 160, delay: 230 },
      );
    }
  }

  async function celebrateCaughtUp() {
    if (!(await caughtUpDelight.claim())) return;

    announceCaughtUp(showId);
    globalThis.window?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function onMilestone(milestone: 'caught-up' | 'season-complete') {
    if (milestone === 'caught-up') celebrateCaughtUp();
    else stampComplete();
  }

  const {
    watchedCount,
    isWatched,
    isUpdating,
    markSeasonAsWatched,
    removeSeasonFromWatched,
  } = $derived(useSeasonWatched({ slug, showId, season }));

  const label = $derived(seasonLabel(season.number));
  const hasAired = $derived(season.airDate <= new Date());
  const progressPercent = $derived(
    season.episodes.count > 0
      ? Math.min(100, ($watchedCount / season.episodes.count) * 100)
      : 0,
  );
  const progressLabel = $derived(
    $watchedCount > 0
      ? `${Math.min($watchedCount, season.episodes.count)}/${season.episodes.count} ${m.text_episodes_unit()}`
      : `${season.episodes.count} ${m.text_episodes_unit()}`,
  );

  function toggleWatched() {
    if ($isWatched) removeSeasonFromWatched();
    else markSeasonAsWatched();
  }
</script>

<li class="season-row" bind:this={row}>
  <div class="season-header">
    <button
      type="button"
      class="season-toggle"
      class:is-open={isOpen}
      onclick={onToggle}
      aria-expanded={isOpen}
    >
      <span class="season-text">
        <span class="season-label">{label}</span>
        {#if season.title}
          <span class="season-title">{season.title}</span>
        {/if}
      </span>
      <span class="season-meta">{progressLabel}</span>
      {#if isStamped}
        <span class="season-stamp">{m.delight_season_complete()}</span>
      {/if}
      <svg viewBox="0 0 24 24" class="season-chevron" fill="currentColor" aria-hidden="true">
        <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
      </svg>
    </button>
    {#if hasAired}
      <RenderFor audience="authenticated">
        <button
          type="button"
          class="watched-btn"
          class:is-watched={$isWatched}
          disabled={$isUpdating}
          onclick={toggleWatched}
          aria-label={$isWatched
            ? m.button_label_remove_from_watched({ title: label })
            : m.button_label_mark_as_watched({ title: label })}
        >
          <TrackIcon state={$isWatched ? 'watched' : 'unwatched'} />
        </button>
      </RenderFor>
    {/if}
  </div>
  <div
    class="season-progress"
    class:is-empty={progressPercent === 0}
    style:--progress="{progressPercent}%"
    aria-hidden="true"
  ></div>
  {#if isOpen}
    <SeasonEpisodes
      {slug}
      season={season.number}
      {showId}
      {showTitle}
      episodeCount={season.episodes.count}
      {seasons}
      {hasEnded}
      {onMilestone}
    />
  {/if}
</li>

<style lang="scss">
  .season-stamp {
    position: absolute;
    left: 50%;
    top: 50%;
    translate: -50% -50%;
    rotate: -8deg;
    padding: var(--ni-2) var(--gap-xs);
    border: var(--border-thickness-s) solid var(--red-600);
    border-radius: var(--border-radius-s);
    color: var(--red-600);
    background: color-mix(in srgb, var(--color-card-background) 85%, transparent);
    font-family: var(--trakttime-font-heading);
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    white-space: nowrap;
    pointer-events: none;
    animation: season-stamp 2600ms cubic-bezier(0.3, 1.4, 0.5, 1) both;
  }

  @keyframes season-stamp {
    0% {
      opacity: 0;
      transform: scale(2.4);
    }
    10%,
    85% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .season-stamp {
      animation: none;
    }
  }

  .season-row {
    border-bottom: var(--ni-1) solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }
  }

  .season-progress {
    height: var(--ni-4);
    margin: 0 var(--gap-m) var(--gap-xs);
    border-radius: var(--trakttime-radius-pill);
    background:
      var(--trakttime-gradient) 0 0 / var(--progress) 100% no-repeat,
      var(--color-border);

    &.is-empty {
      visibility: hidden;
    }
  }

  .season-header {
    display: flex;
    align-items: center;
    padding-right: var(--gap-m);

    .watched-btn {
      width: var(--trakttime-watched-btn-size-compact);
      height: var(--trakttime-watched-btn-size-compact);
    }
  }

  .season-toggle {
    position: relative;
    flex: 1;
    min-width: 0;
    background: none;
    border: none;
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    padding: var(--gap-m);
    cursor: pointer;
    text-align: left;
    -webkit-tap-highlight-color: transparent;
  }

  .season-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .season-label {
    font-family: var(--trakttime-font-heading);
    font-weight: 600;
    font-size: 1.0625rem;
  }

  .season-title {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .season-meta {
    flex-shrink: 0;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
  }

  .season-chevron {
    width: var(--ni-18);
    height: var(--ni-18);
    color: var(--color-text-secondary);
    transition: transform var(--transition-increment) ease-in-out;
  }

  .season-toggle.is-open .season-chevron {
    transform: rotate(180deg);
  }
</style>
