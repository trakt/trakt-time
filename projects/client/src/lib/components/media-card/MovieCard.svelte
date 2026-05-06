<script lang="ts">
  import MarkAsWatchedIcon from '$lib/components/icons/MarkAsWatchedIcon.svelte';
  import { useMarkAsWatched } from '$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts';
  import type { MovieEntry } from '$lib/requests/models/MovieEntry.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import CountdownBadge from '$lib/components/countdown/CountdownBadge.svelte';
  import * as m from '$lib/paraglide/messages.js';

  const { entry }: { entry: MovieEntry } = $props();

  const movieUrl = $derived(UrlBuilder.movie(entry.slug));
  const duration = $derived(
    entry.runtime > 0
      ? `${Math.floor(entry.runtime / 60)}h ${entry.runtime % 60}m`
      : null,
  );
  const genreList = $derived(entry.genres.slice(0, 2).join(', '));
  const isUpcoming = $derived(
    entry.effectiveReleaseDate != null && entry.effectiveReleaseDate > new Date(),
  );

  const { markAsWatched, removeWatched, isWatched, isMarkingAsWatched, isWatchable } =
    $derived(
      useMarkAsWatched({
        type: 'movie',
        media: {
          id: entry.id,
          effectiveReleaseDate: entry.effectiveReleaseDate,
          status: entry.status,
        },
      }),
    );

  function toggleWatched() {
    if ($isWatched) removeWatched();
    else markAsWatched();
  }
</script>

<article class="movie-card">
  <a href={movieUrl} aria-label={entry.title} class="movie-card-poster-link">
    <div class="movie-card-poster">
      <img
        src={entry.poster.url.thumb}
        alt={entry.title}
        loading="lazy"
        class="poster-img"
      />
      {#if isUpcoming}
        <CountdownBadge releaseDate={entry.effectiveReleaseDate} />
      {/if}
    </div>
  </a>

  <div class="movie-card-body">
    <a href={movieUrl} aria-label={entry.title} class="movie-title">
      {entry.title}
    </a>

    {#if duration || genreList}
      <p class="movie-meta">
        {#if duration}{duration}{/if}
        {#if duration && genreList} • {/if}
        {#if genreList}{genreList}{/if}
      </p>
    {/if}
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
      <MarkAsWatchedIcon state={$isWatched ? 'watched' : 'unwatched'} />
    </button>
  {/if}
</article>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .movie-card {
    display: flex;
    align-items: center;
    gap: var(--gap-m);
    padding: var(--gap-s) var(--gap-m);
    border-bottom: var(--ni-1) solid var(--color-border);
    background-color: var(--color-card-background);
  }

  :global(.movie-card-poster-link) {
    flex-shrink: 0;
    display: block;
    text-decoration: none;
  }

  .movie-card-poster {
    position: relative;
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

  .movie-card-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxs);
  }

  :global(.movie-title) {
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-decoration: none;
    display: block;
  }

  .movie-meta {
    margin: 0;
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

    &:hover,
    &:focus-visible {
      border-color: var(--trakttime-accent);
      color: var(--trakttime-accent);
    }

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
