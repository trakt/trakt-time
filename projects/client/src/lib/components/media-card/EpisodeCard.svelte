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

<article class="media-row">
  <a href={episodeUrl} aria-label={entry.title} class="media-row-thumb-link">
    <div class="media-row-thumb">
      <img src={entry.show.poster.url.thumb} alt={entry.show.title} loading="lazy" />
      {#if badgeLabel}
        <span class="media-row-thumb-tag">{badgeLabel}</span>
      {/if}
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
