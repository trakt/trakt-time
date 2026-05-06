<script lang="ts">
  import type { UpcomingEpisodeEntry } from '$lib/requests/queries/calendars/upcomingEpisodesQuery.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';

  const { entry }: { entry: UpcomingEpisodeEntry } = $props();

  const showUrl = $derived(UrlBuilder.show(entry.show.slug));
  const episodeUrl = $derived(
    UrlBuilder.episode(entry.show.slug, entry.season, entry.number),
  );

  const seasonLabel = $derived(`S${entry.season.toString().padStart(2, '0')}`);
  const episodeLabel = $derived(`E${entry.number.toString().padStart(2, '0')}`);
  const extraCount = $derived(
    entry.episodes && entry.episodes.length > 1
      ? ` +${entry.episodes.length - 1}`
      : '',
  );

  const isPremiere = $derived(
    entry.type === 'series_premiere' ||
      entry.type === 'season_premiere' ||
      entry.type === 'mid_season_premiere',
  );

  const isFinale = $derived(
    entry.type === 'series_finale' ||
      entry.type === 'season_finale' ||
      entry.type === 'mid_season_finale',
  );

  const badgeLabel = $derived(
    isPremiere ? 'PREMIERE' : isFinale ? 'FINALE' : null,
  );

  const thumbnailUrl = $derived(
    entry.cover.url ?? entry.show.poster.url.thumb,
  );

  const airInfo = $derived(
    [entry.show.airs?.time, entry.show.network].filter(Boolean).join(' • '),
  );
</script>

<article class="upcoming-card">
  <a href={episodeUrl} aria-label={entry.title} class="upcoming-card-thumb-link">
    <div class="upcoming-card-thumb">
      {#if thumbnailUrl}
        <img
          src={thumbnailUrl}
          alt={entry.show.title}
          loading="lazy"
          class="thumb-img"
        />
      {/if}
    </div>
  </a>

  <div class="upcoming-card-body">
    {#if airInfo}
      <span class="air-info">{airInfo}</span>
    {/if}

    <a href={showUrl} aria-label={entry.show.title} class="show-title-pill">
      {entry.show.title}
      <span class="show-title-chevron">›</span>
    </a>

    <div class="episode-meta">
      <span class="episode-code"
        >{seasonLabel} | {episodeLabel}{extraCount}</span
      >
      {#if badgeLabel}
        <span class="episode-badge">{badgeLabel}</span>
      {/if}
    </div>

    <a href={episodeUrl} aria-label={entry.title} class="episode-title">
      {entry.title}
    </a>
  </div>
</article>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .upcoming-card {
    display: flex;
    align-items: center;
    gap: var(--gap-m);
    padding: var(--gap-s) var(--gap-m);
    border-bottom: var(--ni-1) solid var(--color-border);
    background-color: var(--color-card-background);
  }

  :global(.upcoming-card-thumb-link) {
    flex-shrink: 0;
    display: block;
    text-decoration: none;
  }

  .upcoming-card-thumb {
    width: var(--trakttime-upcoming-thumb-width);
    aspect-ratio: 16 / 9;
    border-radius: var(--border-radius-s);
    overflow: hidden;
    background-color: var(--color-border);
  }

  .thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .upcoming-card-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxs);
  }

  .air-info {
    font-size: 0.625rem;
    font-weight: 500;
    color: var(--trakttime-accent);
    letter-spacing: 0.04em;
    text-transform: uppercase;
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
</style>
