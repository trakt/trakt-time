<script lang="ts">
  import MarkAsWatchedIcon from '$lib/components/icons/MarkAsWatchedIcon.svelte';
  import type { MovieActivityHistory } from '$lib/requests/queries/users/movieActivityHistoryQuery.ts';
  import { useMarkAsWatched } from '$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import * as m from '$lib/paraglide/messages.js';

  const { entry }: { entry: MovieActivityHistory } = $props();

  const movieUrl = $derived(UrlBuilder.movie(entry.movie.slug));

  const { markAsWatched, removeWatched, isWatched, isMarkingAsWatched } =
    $derived(
      useMarkAsWatched({
        type: 'movie',
        media: {
          id: entry.movie.id,
          effectiveReleaseDate: entry.movie.effectiveReleaseDate,
          status: entry.movie.status,
        },
      }),
    );

  function toggleWatched() {
    if ($isWatched) removeWatched();
    else markAsWatched();
  }
</script>

<article class="history-row">
  <a href={movieUrl} aria-label={entry.movie.title} class="history-poster-link">
    <div class="history-poster">
      <img
        src={entry.movie.poster.url.thumb}
        alt={entry.movie.title}
        loading="lazy"
        class="poster-img"
      />
    </div>
  </a>

  <div class="history-body">
    <a href={movieUrl} aria-label={entry.movie.title} class="history-title">
      {entry.movie.title}
    </a>
    {#if entry.movie.year}
      <span class="history-meta">{entry.movie.year}</span>
    {/if}
  </div>

  <button
    type="button"
    class="watched-btn"
    class:is-watched={$isWatched}
    aria-label={$isWatched
      ? m.button_label_remove_from_watched({ title: entry.movie.title })
      : m.button_label_mark_as_watched({ title: entry.movie.title })}
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

  :global(.history-row .history-title) {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-decoration: none;
    display: block;
  }

  .history-meta {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
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
