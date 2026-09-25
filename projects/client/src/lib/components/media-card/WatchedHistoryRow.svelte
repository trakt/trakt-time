<script lang="ts">
  import TrackIcon from '$lib/components/icons/TrackIcon.svelte';
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

<article class="media-row" data-variant="history">
  <a href={episodeUrl} aria-label={entry.episode.title} class="media-row-thumb-link">
    <div class="media-row-thumb">
      <img src={entry.show.poster.url.thumb} alt={entry.show.title} loading="lazy" />
    </div>
  </a>

  <div class="media-row-body">
    <a href={showUrl} aria-label={entry.show.title} class="media-row-title">
      {entry.show.title}
    </a>

    <div class="media-row-meta">
      <span>{seasonLabel} {episodeLabel}</span>
    </div>

    <a href={episodeUrl} aria-label={entry.episode.title} class="media-row-subtitle">
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
    <TrackIcon state={$isWatched ? 'watched' : 'unwatched'} />
  </button>
</article>
