<script lang="ts">
  import MarkAsWatchedIcon from '$lib/components/icons/MarkAsWatchedIcon.svelte';
  import type { EpisodeActivityHistory } from '$lib/requests/queries/users/episodeActivityHistoryQuery.ts';
  import { useMarkAsWatched } from '$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import * as m from '$lib/paraglide/messages.js';

  const { entry }: { entry: EpisodeActivityHistory } = $props();

  const showUrl = $derived(UrlBuilder.show(entry.show.slug));
  const episodeUrl = $derived(
    UrlBuilder.episode(entry.show.slug, entry.episode.season, entry.episode.number),
  );
  const seasonLabel = $derived(`S${entry.episode.season.toString().padStart(2, '0')}`);
  const episodeLabel = $derived(`E${entry.episode.number.toString().padStart(2, '0')}`);

  const { markAsWatched, removeWatched, isWatched, isMarkingAsWatched } = $derived(
    useMarkAsWatched({
      type: 'episode',
      media: {
        id: entry.episode.id,
        effectiveReleaseDate: entry.episode.effectiveReleaseDate,
        season: entry.episode.season,
        number: entry.episode.number,
      },
      show: { id: entry.show.id, title: entry.show.title },
    }),
  );

  function toggleWatched() {
    if ($isWatched) removeWatched();
    else markAsWatched();
  }
</script>

<article class="history-row">
  <a href={episodeUrl} aria-label={entry.episode.title} class="history-poster-link">
    <div class="history-poster">
      <img
        src={entry.show.poster.url.thumb}
        alt={entry.show.title}
        loading="lazy"
        class="poster-img"
      />
    </div>
  </a>

  <div class="history-body">
    <a href={showUrl} aria-label={entry.show.title} class="show-title-pill">
      {entry.show.title}
      <span class="show-title-chevron">›</span>
    </a>

    <div class="history-meta">
      <span class="history-code">{seasonLabel} | {episodeLabel}</span>
    </div>

    <a href={episodeUrl} aria-label={entry.episode.title} class="history-title">
      {entry.episode.title}
    </a>
  </div>

  <button
    type="button"
    class="watched-btn"
    class:is-watched={$isWatched}
    aria-label={$isWatched
      ? m.button_label_remove_from_watched({ title: entry.episode.title })
      : m.button_label_mark_as_watched({ title: entry.episode.title })}
    disabled={$isMarkingAsWatched}
    onclick={toggleWatched}
  >
    <MarkAsWatchedIcon state={$isWatched ? 'watched' : 'unwatched'} />
  </button>
</article>

<style lang="scss">
  .history-row {
    display: flex;
    align-items: center;
    gap: var(--gap-m);
    padding: var(--gap-s) var(--gap-m);
    border-bottom: var(--ni-1) solid var(--color-border);
    background-color: var(--color-card-background);
    opacity: 0.45;
    transition: opacity var(--transition-increment) ease-in-out;

    &:hover,
    &:focus-within {
      opacity: 0.85;
    }
  }

  :global(.history-poster-link) {
    flex-shrink: 0;
    display: block;
    text-decoration: none;
  }

  .history-poster {
    width: var(--trakttime-list-poster-width);
    aspect-ratio: 2 / 3;
    border-radius: var(--border-radius-s);
    overflow: hidden;
    background-color: var(--color-card-background);
  }

  .poster-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .history-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxs);
  }

  .history-meta {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
  }

  .history-code {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    letter-spacing: 0.04em;
  }

  :global(.history-row .history-title) {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-decoration: none;
    display: block;
  }

  .watched-btn {
    flex-shrink: 0;
    background: none;
    border: var(--ni-2) solid var(--color-border);
    border-radius: 50%;
    width: var(--trakttime-watched-btn-size);
    height: var(--trakttime-watched-btn-size);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
    transition:
      border-color var(--transition-increment) ease-in-out,
      color var(--transition-increment) ease-in-out,
      background var(--transition-increment) ease-in-out;

    &.is-watched {
      border-color: var(--trakttime-accent);
      background: var(--trakttime-accent);
      color: var(--color-background);
    }

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }
</style>
