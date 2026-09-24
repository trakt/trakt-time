<script lang="ts">
  import CrossOriginImage from '$lib/features/image/components/CrossOriginImage.svelte';
  import TrackIcon from '$lib/components/icons/TrackIcon.svelte';
  import type { EpisodeEntry } from '$lib/requests/models/EpisodeEntry.ts';
  import { useMarkAsWatched } from '$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import { getEpisodeStatus } from '$lib/utils/media/getEpisodeStatus.ts';
  import { episodeStatusLabel } from '$lib/utils/media/episodeStatusLabel.ts';
  import * as m from '$lib/paraglide/messages.js';

  type Props = {
    slug: string;
    episode: EpisodeEntry;
    showId: number;
    showTitle: string;
    onWatched: (episode: EpisodeEntry) => void;
  };
  const { slug, episode, showId, showTitle, onWatched }: Props = $props();

  const { markAsWatched, removeWatched, isWatched, isMarkingAsWatched, isWatchable } =
    $derived(
      useMarkAsWatched({
        type: 'episode',
        media: {
          id: episode.id,
          effectiveReleaseDate: episode.effectiveReleaseDate,
          season: episode.season,
          number: episode.number,
        },
        show: { id: showId, title: showTitle },
      }),
    );

  const statusLabel = $derived(
    episodeStatusLabel(
      getEpisodeStatus({
        type: episode.type,
        releaseDate: episode.effectiveReleaseDate,
      }),
    ),
  );

  async function toggle() {
    if ($isWatched) {
      removeWatched();
      return;
    }

    await markAsWatched();
    onWatched(episode);
  }
</script>

<li class="episode-row">
  <a
    class="episode-link"
    href={UrlBuilder.episode(slug, episode.season, episode.number)}
  >
    <div class="episode-thumb">
      {#if episode.cover.url}
        <CrossOriginImage
          src={episode.cover.url}
          alt={episode.title}
          loading="lazy"
        />
      {:else}
        <span class="episode-thumb-fallback" aria-hidden="true">
          {episode.number}
        </span>
      {/if}
    </div>
    <div class="episode-text">
      <span class="episode-meta">
        <span class="episode-number">E{episode.number}</span>
        {#if statusLabel}
          <span class="episode-badge">{statusLabel}</span>
        {/if}
      </span>
      <span class="episode-title">{episode.title}</span>
    </div>
  </a>
  {#if isWatchable}
    <button
      type="button"
      class="watched-btn"
      class:is-watched={$isWatched}
      disabled={$isMarkingAsWatched}
      onclick={toggle}
      aria-label={$isWatched
        ? m.button_label_remove_from_watched({ title: episode.title })
        : m.button_label_mark_as_watched({ title: episode.title })}
    >
      <TrackIcon state={$isWatched ? 'watched' : 'unwatched'} />
    </button>
  {/if}
</li>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;
  .episode-row {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    padding: var(--gap-s) var(--gap-m);
    border-bottom: var(--ni-1) solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }
  }

  .episode-link {
    flex: 1;
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    text-decoration: none;
    color: var(--color-text-primary);
    min-width: 0;
  }

  .episode-thumb {
    flex-shrink: 0;
    width: 4.5rem;
    aspect-ratio: 16 / 9;
    border-radius: var(--border-radius-s);
    overflow: hidden;
    background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;

    :global(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  .episode-thumb-fallback {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--color-text-secondary);
  }

  .episode-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .episode-meta {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
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

  .episode-number {
    font-size: 0.6875rem;
    font-weight: 700;
    color: var(--color-text-secondary);
    letter-spacing: 0.04em;
  }

  .episode-title {
    font-size: 0.875rem;
    color: var(--color-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
    transition:
      border-color var(--transition-increment) ease-in-out,
      color var(--transition-increment) ease-in-out,
      background var(--transition-increment) ease-in-out;

    &.is-watched {
      border-color: var(--trakttime-accent);
      background: var(--trakttime-accent);
      color: var(--color-background);
    }

    /* Direct hover on an already-watched toggle previews removal. */
    @include for-mouse {
      &.is-watched:hover,
      &.is-watched:focus-visible {
        border-color: var(--red-400);
        background: var(--red-400);
      }
    }

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }
</style>
