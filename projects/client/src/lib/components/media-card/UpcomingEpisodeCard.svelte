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

  const airInfo = $derived(
    [entry.show.airs?.time, entry.show.network].filter(Boolean),
  );
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
      <span>{seasonLabel} {episodeLabel}{extraCount}</span>
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
  @use '$style/scss/mixins/index' as *;

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

  @include for-desktop {
    :global(.upcoming-day) .air-info {
      display: contents;
      text-align: start;

      span:first-child {
        position: absolute;
        top: var(--gap-xs);
        left: var(--gap-xs);
        padding: var(--ni-2) var(--ni-6);
        border-radius: var(--border-radius-xs);
        background: var(--trakttime-overlay-chip-background);
        color: var(--trakttime-overlay-text-primary);
        font-size: 0.75rem;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }

      span:last-child:not(:first-child) {
        font-size: 0.75rem;
        color: var(--color-text-secondary);
      }
    }
  }
</style>
