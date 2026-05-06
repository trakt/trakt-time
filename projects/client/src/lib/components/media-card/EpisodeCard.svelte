<script lang="ts">
  import MarkAsWatchedIcon from '$lib/components/icons/MarkAsWatchedIcon.svelte';
  import { useMarkAsWatched } from '$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts';
  import type { UpNextEntry } from '$lib/requests/models/UpNextEntry.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import { EpisodePremiereType, EpisodeFinaleType } from '$lib/requests/models/EpisodeType.ts';
  import * as m from '$lib/paraglide/messages.js';

  const { entry }: { entry: UpNextEntry } = $props();

  const showUrl = $derived(UrlBuilder.show(entry.show.slug));
  const episodeUrl = $derived(UrlBuilder.episode(entry.show.slug, entry.season, entry.number));
  const seasonLabel = $derived(`S${entry.season.toString().padStart(2, '0')}`);
  const episodeLabel = $derived(`E${entry.number.toString().padStart(2, '0')}`);
  const remainingLabel = $derived(entry.remaining > 1 ? ` +${entry.remaining - 1}` : '');
  const badgeLabel = $derived(
    Object.values(EpisodePremiereType).includes(entry.type as never)
      ? m.tag_text_premiere()
      : Object.values(EpisodeFinaleType).includes(entry.type as never)
        ? m.tag_text_finale()
        : null,
  );

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

<article class="episode-card">
  <a href={episodeUrl} aria-label={entry.title} class="episode-card-poster-link">
    <div class="episode-card-poster">
      <img
        src={entry.show.poster.url.thumb}
        alt={entry.show.title}
        loading="lazy"
        class="poster-img"
      />
    </div>
  </a>

  <div class="episode-card-body">
    <a href={showUrl} aria-label={entry.show.title} class="show-title-pill">
      {entry.show.title}
      <span class="show-title-chevron">›</span>
    </a>

    <div class="episode-meta">
      <span class="episode-code">{seasonLabel} | {episodeLabel}{remainingLabel}</span>
      {#if badgeLabel}
        <span class="episode-badge">{badgeLabel}</span>
      {/if}
    </div>

    <a href={episodeUrl} aria-label={entry.title} class="episode-title">
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
      <MarkAsWatchedIcon state={$isWatched ? 'watched' : 'unwatched'} />
    </button>
  {/if}
</article>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .episode-card {
    display: flex;
    align-items: center;
    gap: var(--gap-m);
    padding: var(--gap-s) var(--gap-m);
    border-bottom: var(--ni-1) solid var(--color-border);
    background-color: var(--color-card-background);
  }

  :global(.episode-card-poster-link) {
    flex-shrink: 0;
    display: block;
    text-decoration: none;
  }

  .episode-card-poster {
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

  .episode-card-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxs);
  }

  .episode-meta {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
  }

  .episode-code {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    letter-spacing: 0.04em;
  }

  .episode-badge {
    font-size: 0.5rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--trakttime-accent);
    border: var(--ni-1) solid var(--trakttime-accent);
    padding: var(--ni-1) 5px;
    border-radius: var(--border-radius-xs);
  }

  :global(.episode-title) {
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
