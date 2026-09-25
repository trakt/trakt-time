<script lang="ts">
  import TrackIcon from '$lib/components/icons/TrackIcon.svelte';
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
  };
  const { slug, season, seasons, showId, showTitle, isOpen, onToggle }: Props =
    $props();

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

<li class="season-row">
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
    />
  {/if}
</li>

<style lang="scss">
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
  }

  .season-toggle {
    flex: 1;
    min-width: 0;
    background: none;
    border: none;
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    padding: var(--gap-s) var(--gap-m);
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
