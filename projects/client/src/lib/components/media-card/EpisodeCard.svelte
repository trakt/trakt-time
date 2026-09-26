<script lang="ts">
  import TrackIcon from '$lib/components/icons/TrackIcon.svelte';
  import { useMarkAsWatched } from '$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts';
  import type { UpNextEntry } from '$lib/requests/models/UpNextEntry.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import { getEpisodeStatus } from '$lib/utils/media/getEpisodeStatus.ts';
  import { episodeStatusLabel } from '$lib/utils/media/episodeStatusLabel.ts';
  import * as m from '$lib/paraglide/messages.js';

  const { entry }: { entry: UpNextEntry } = $props();

  const showUrl = $derived(UrlBuilder.show(entry.show.slug));
  const episodeUrl = $derived(UrlBuilder.episode(entry.show.slug, entry.season, entry.number));
  const seasonLabel = $derived(`S${entry.season.toString().padStart(2, '0')}`);
  const episodeLabel = $derived(`E${entry.number.toString().padStart(2, '0')}`);
  const progressLabel = $derived(`${entry.completed}/${entry.total}`);
  const progressPercent = $derived(
    entry.total > 0 ? Math.round((entry.completed / entry.total) * 100) : 0,
  );
  const status = $derived(
    getEpisodeStatus({ type: entry.type, releaseDate: entry.effectiveReleaseDate }),
  );
  const badgeLabel = $derived(episodeStatusLabel(status));

  const { markAsWatched, removeWatched, isWatched, isMarkingAsWatched, isWatchable } =
    $derived(
      useMarkAsWatched({
        type: 'episode',
        media: {
          id: entry.id,
          effectiveReleaseDate: entry.effectiveReleaseDate,
          season: entry.season,
          number: entry.number,
        },
        show: { id: entry.show.id, title: entry.show.title },
      }),
    );

  function toggleWatched() {
    if ($isWatched) removeWatched();
    else markAsWatched();
  }
</script>

<article class="media-row episode-card">
  <a href={episodeUrl} aria-label={entry.title} class="media-row-thumb-link">
    <div class="media-row-thumb">
      <img src={entry.show.poster.url.thumb} alt={entry.show.title} loading="lazy" />
      {#if badgeLabel}
        <span class="media-row-thumb-tag">{badgeLabel}</span>
      {/if}
    </div>
    <div class="episode-card-cover">
      <img src={entry.show.cover.url.medium} alt="" loading="lazy" />
      {#if badgeLabel}
        <span class="episode-card-badge">{badgeLabel}</span>
      {/if}
      <span class="episode-card-progress" style:--progress="{progressPercent}%"></span>
    </div>
  </a>

  <div class="media-row-body">
    <a href={showUrl} aria-label={entry.show.title} class="media-row-title">
      {entry.show.title}
    </a>

    <div class="media-row-meta">
      <span>{seasonLabel} {episodeLabel} · {progressLabel}</span>
    </div>

    <a href={episodeUrl} aria-label={entry.title} class="media-row-subtitle">
      {entry.title}
    </a>
  </div>

  {#if isWatchable}
    <button
      class="watched-btn"
      class:is-watched={$isWatched}
      aria-label={$isWatched
        ? m.button_label_remove_from_watched({ title: entry.title })
        : m.button_label_mark_as_watched({ title: entry.title })}
      disabled={$isMarkingAsWatched}
      onclick={toggleWatched}
      type="button"
    >
      <TrackIcon state={$isWatched ? 'watched' : 'unwatched'} />
    </button>
  {/if}
</article>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .episode-card-cover {
    display: none;
  }

  @include for-desktop {
    :global(.media-grid[data-layout='tiles']) .episode-card {
      display: grid;
      grid-template-areas: 'cover' 'body';
      align-items: start;
      gap: var(--gap-s);
      margin: 0;
      padding: 0;
      background: none;
      border-radius: 0;
      overflow: visible;

      .media-row-thumb-link {
        grid-area: cover;
      }

      .media-row-thumb {
        display: none;
      }

      .episode-card-cover {
        display: block;
        position: relative;
        aspect-ratio: 16 / 9;
        border-radius: var(--trakttime-radius-card);
        overflow: hidden;
        background-color: var(--color-card-background);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform var(--transition-increment) ease-in-out;
        }
      }

      .media-row-body {
        grid-area: body;
        padding: 0;
      }

      .watched-btn {
        grid-area: cover;
        align-self: end;
        justify-self: end;
        margin: 0 var(--gap-s) var(--gap-m);
        backdrop-filter: blur(12px);

        &:not(.is-watched, :hover, :focus-visible) {
          border-color: var(--trakttime-overlay-control-border);
          background: var(--trakttime-overlay-control-background);
          color: var(--trakttime-overlay-text-primary);
        }
      }

      @include for-mouse {
        &:hover .episode-card-cover img {
          transform: scale(1.03);
        }
      }
    }
  }

  .episode-card-badge {
    position: absolute;
    top: var(--gap-xs);
    left: var(--gap-xs);
    padding: var(--ni-4) var(--gap-xs);
    border-radius: var(--border-radius-xs);
    background: var(--trakttime-overlay-chip-background);
    color: var(--trakttime-overlay-text-primary);
    font-size: 0.625rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .episode-card-progress {
    position: absolute;
    inset: auto 0 0;
    height: var(--ni-4);
    background: color-mix(in srgb, var(--shade-10) 18%, transparent);

    &::after {
      content: '';
      display: block;
      width: var(--progress);
      height: 100%;
      background: var(--trakttime-gradient);
    }
  }
</style>
