<script lang="ts">
  import TrackIcon from '$lib/components/icons/TrackIcon.svelte';
  import { onMount } from 'svelte';
  import { useMarkAsWatched } from '$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts';
  import type { UpNextEntry } from '$lib/requests/models/UpNextEntry.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import { getEpisodeStatus } from '$lib/utils/media/getEpisodeStatus.ts';
  import { episodeStatusLabel } from '$lib/utils/media/episodeStatusLabel.ts';
  import * as m from '$lib/paraglide/messages.js';
  import { celebrate } from '$lib/features/delight/celebrate.ts';
  import { isNewSeason } from '$lib/features/delight/delightRules.ts';
  import Sparkles from '$lib/features/delight/effects/Sparkles.svelte';
  import { tickAndRing } from '$lib/features/delight/tickAndRing.ts';
  import { useDelight } from '$lib/features/delight/useDelight.ts';
  import { hasEnded } from '$lib/utils/media/hasEnded.ts';

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

  const newSeasonDelight = useDelight('new-season');
  const GLOW_DURATION = 2300;
  let isGlowing = $state(false);

  async function glowNewSeason() {
    const onceKey = `${entry.show.id}:${entry.season}`;
    if (!(await newSeasonDelight.claim({ onceKey }))) return;

    isGlowing = true;
    setTimeout(() => (isGlowing = false), GLOW_DURATION);
  }

  onMount(() => {
    const isNew = isNewSeason({
      type: entry.type,
      number: entry.number,
      releaseDate: entry.effectiveReleaseDate,
      now: new Date(),
    });
    if (isNew) glowNewSeason();
  });

  const checkDelight = useDelight('episode-check');
  const caughtUpDelight = useDelight('caught-up');
  let watchedButton: HTMLButtonElement | null = $state(null);
  let isCaughtUp = $state(false);

  async function celebrateCaughtUp(button: HTMLElement) {
    if (!(await caughtUpDelight.claim())) return false;

    isCaughtUp = true;
    tickAndRing(button);
    celebrate({ effect: Sparkles, at: button });
    return true;
  }

  async function toggleWatched() {
    if ($isWatched) {
      removeWatched();
      return;
    }

    const isLastAired = entry.remaining === 1 && !hasEnded(entry.show.status);
    await markAsWatched();

    const button = watchedButton;
    if (!button) return;
    if (isLastAired && (await celebrateCaughtUp(button))) return;
    if (await checkDelight.claim()) tickAndRing(button);
  }
</script>

<article class="media-row episode-card" class:is-new-season={isGlowing}>
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
      class:is-caught-up={isCaughtUp}
      aria-label={$isWatched
        ? m.button_label_remove_from_watched({ title: entry.title })
        : m.button_label_mark_as_watched({ title: entry.title })}
      disabled={$isMarkingAsWatched}
      onclick={toggleWatched}
      bind:this={watchedButton}
      type="button"
    >
      <TrackIcon state={$isWatched ? 'watched' : 'unwatched'} />
    </button>
  {/if}
</article>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .episode-card.is-new-season {
    animation: new-season-glow 900ms ease-out 400ms 2 both;
  }

  @keyframes new-season-glow {
    0% {
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--yellow-400) 0%, transparent);
    }
    40% {
      box-shadow: 0 0 0 var(--ni-4) color-mix(in srgb, var(--yellow-400) 60%, transparent);
    }
    100% {
      box-shadow: 0 0 0 var(--ni-12) color-mix(in srgb, var(--yellow-400) 0%, transparent);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .episode-card.is-new-season {
      animation: none;
      box-shadow: 0 0 0 var(--ni-2) var(--yellow-400);
    }
  }

  .watched-btn.is-caught-up {
    border-color: transparent;
    background: var(--green-600);
    color: var(--shade-10);
  }

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
