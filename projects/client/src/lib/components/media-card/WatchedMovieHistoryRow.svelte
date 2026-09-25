<script lang="ts">
  import TrackIcon from '$lib/components/icons/TrackIcon.svelte';
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

<article class="media-row" data-variant="history">
  <a href={movieUrl} aria-label={entry.movie.title} class="media-row-thumb-link">
    <div class="media-row-thumb">
      <img src={entry.movie.poster.url.thumb} alt={entry.movie.title} loading="lazy" />
    </div>
  </a>

  <div class="media-row-body">
    <a href={movieUrl} aria-label={entry.movie.title} class="media-row-title">
      {entry.movie.title}
    </a>
    {#if entry.movie.year}
      <span class="media-row-meta">{entry.movie.year}</span>
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
    <TrackIcon state={$isWatched ? 'watched' : 'unwatched'} />
  </button>
</article>
