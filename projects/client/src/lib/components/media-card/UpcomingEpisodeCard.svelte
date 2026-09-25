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
    entry.cover.url ?? entry.show.cover.url.thumb,
  );

  const airInfo = $derived(
    [entry.show.airs?.time, entry.show.network].filter(Boolean),
  );
</script>

<article class="media-row">
  <a href={episodeUrl} aria-label={entry.title} class="media-row-thumb-link">
    <div class="media-row-thumb">
      {#if thumbnailUrl}
        <img src={thumbnailUrl} alt={entry.show.title} loading="lazy" />
      {/if}
    </div>
  </a>

  <div class="media-row-body">
    <a href={showUrl} aria-label={entry.show.title} class="media-row-title">
      {entry.show.title}
    </a>

    <div class="media-row-meta">
      <span>{seasonLabel} {episodeLabel}{extraCount}</span>
      {#if badgeLabel}
        <span class="episode-badge">{badgeLabel}</span>
      {/if}
    </div>

    <a href={episodeUrl} aria-label={entry.title} class="media-row-subtitle">
      {entry.title}
    </a>
  </div>

  {#if airInfo.length > 0}
    <div class="air-info">
      {#each airInfo as line, i (i)}
        <span>{line}</span>
      {/each}
    </div>
  {/if}
</article>

<style lang="scss">
  .air-info {
    flex-shrink: 0;
    max-width: 28%;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: end;
    font-size: 0.75rem;
    color: var(--color-text-secondary);

    span:first-child {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }
  }
</style>
