<script lang="ts">
  import TrackIcon from '$lib/components/icons/TrackIcon.svelte';
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
  const metaLabel = $derived([entry.year, duration].filter(Boolean).join(' · '));
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

<article class="media-row">
  <a href={movieUrl} aria-label={entry.title} class="media-row-thumb-link">
    <div class="media-row-thumb">
      <img src={entry.poster.url.thumb} alt={entry.title} loading="lazy" />
      {#if isUpcoming}
        <CountdownBadge releaseDate={entry.effectiveReleaseDate} />
      {/if}
    </div>
  </a>

  <div class="media-row-body">
    <a href={movieUrl} aria-label={entry.title} class="media-row-title">
      {entry.title}
    </a>

    {#if metaLabel}
      <p class="media-row-meta">{metaLabel}</p>
    {/if}

    {#if entry.overview}
      <p class="media-row-subtitle">{entry.overview}</p>
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
      <TrackIcon state={$isWatched ? 'watched' : 'unwatched'} />
    </button>
  {/if}
</article>
