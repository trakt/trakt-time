<script lang="ts">
  import { page } from '$app/state';
  import CrossOriginImage from '$lib/features/image/components/CrossOriginImage.svelte';
  import BackBar from '$lib/components/back-bar/BackBar.svelte';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import { episodeSummaryQuery } from '$lib/requests/queries/episode/episodeSummaryQuery.ts';
  import { episodeIntlQuery } from '$lib/requests/queries/episode/episodeIntlQuery.ts';
  import { episodePeopleQuery } from '$lib/requests/queries/episode/episodePeopleQuery.ts';
  import { showSummaryQuery } from '$lib/requests/queries/shows/showSummaryQuery.ts';
  import {
    EpisodeFinaleType,
    EpisodePremiereType,
  } from '$lib/requests/models/EpisodeType.ts';
  import { findRegionalIntl } from '$lib/utils/media/findRegionalIntl.ts';
  import { getLanguageAndRegion, languageTag } from '$lib/features/i18n/index.ts';
  import CastSection from '$lib/sections/summary/_internal/CastSection.svelte';
  import CommentsSection from '$lib/sections/summary/_internal/CommentsSection.svelte';
  import WatchedRow from '$lib/components/watched-row/WatchedRow.svelte';
  import { hasAired } from '$lib/utils/media/hasAired.ts';
  import * as m from '$lib/paraglide/messages.js';

  const slug = page.params.slug ?? '';
  const season = Number(page.params.season ?? 0);
  const episodeNum = Number(page.params.episode ?? 0);

  const episodeQuery = $derived(
    useQuery(episodeSummaryQuery({ slug, season, episode: episodeNum })),
  );

  const showQuery = $derived(useQuery(showSummaryQuery({ slug })));

  const peopleQuery = $derived(
    useQuery(episodePeopleQuery({ slug, season, episode: episodeNum })),
  );
  const cast = $derived($peopleQuery.data?.cast ?? []);
  const castLoading = $derived($peopleQuery.isLoading);

  const episode = $derived($episodeQuery.data ?? null);
  const show = $derived($showQuery.data ?? null);
  const isLoading = $derived($episodeQuery.isLoading && !episode);

  const locale = $derived(languageTag());
  const region = $derived(getLanguageAndRegion());
  const intlQuery = $derived(
    useQuery(
      episodeIntlQuery({
        slug,
        season,
        episode: episodeNum,
        language: region.language,
        enabled: locale !== 'en',
      }),
    ),
  );
  const intl = $derived(
    episode
      ? findRegionalIntl({
          type: 'episode',
          translations: $intlQuery.data,
          fallback: {
            title: episode.title,
            overview: episode.overview ?? '',
          },
        })
      : null,
  );

  const showUrl = $derived(`/shows/${slug}`);

  const seasonLabel = $derived(`S${season.toString().padStart(2, '0')}`);
  const episodeLabel = $derived(`E${episodeNum.toString().padStart(2, '0')}`);

  const episodeHasAired = $derived(
    episode
      ? hasAired({
          type: episode.type ?? 'episode',
          effectiveReleaseDate: episode.effectiveReleaseDate,
        })
      : false,
  );

  const ratingLabel = $derived(
    episode?.rating && episodeHasAired
      ? `${(episode.rating * 10).toFixed(1)} / 10`
      : null,
  );

  const duration = $derived(
    episode && episode.runtime > 0 ? `${episode.runtime}m` : null,
  );

  const airDateLabel = $derived(
    episode?.airDate
      ? new Intl.DateTimeFormat(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(episode.airDate)
      : null,
  );

  const coverUrl = $derived(
    episode?.cover.url ?? show?.cover.url.medium ?? null,
  );

  const isPremiere = $derived(
    episode?.type != null &&
      Object.values(EpisodePremiereType).includes(episode.type as never),
  );

  const isFinale = $derived(
    episode?.type != null &&
      Object.values(EpisodeFinaleType).includes(episode.type as never),
  );

  const badgeLabel = $derived(
    isPremiere ? m.tag_text_premiere() : isFinale ? m.tag_text_finale() : null,
  );
</script>

<svelte:head>
  <title>
    {episode
      ? `${intl?.title ?? episode.title} - ${seasonLabel}${episodeLabel} - Trakt Time`
      : 'Trakt Time'}
  </title>
</svelte:head>

<div class="episode-page">
  <BackBar href={showUrl} label={show?.title ?? ''} />

  {#if isLoading}
    <div class="loading-state">
      <LoadingIndicator />
    </div>
  {:else if episode}
    {#if coverUrl}
      <div class="cover-hero" style:--cover-url="url({coverUrl})">
        <div class="cover-gradient"></div>
      </div>
    {:else}
      <div class="cover-placeholder"></div>
    {/if}

    <div class="episode-content">
      <div class="episode-header">
        {#if show}
          <div class="poster-wrap">
            <CrossOriginImage
              src={show.poster.url.medium}
              alt={show.title}
            />
          </div>
        {/if}

        <div class="episode-info">
          <div class="episode-code-row">
            <span class="episode-code">{seasonLabel} | {episodeLabel}</span>
            {#if badgeLabel}
              <span class="episode-badge">{badgeLabel}</span>
            {/if}
          </div>

          <h1 class="episode-title">{intl?.title ?? episode.title}</h1>

          <div class="episode-meta">
            {#if airDateLabel}<span>{airDateLabel}</span>{/if}
            {#if duration}<span>{duration}</span>{/if}
          </div>

          {#if ratingLabel}
            <div class="rating">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                class="star-icon"
                aria-hidden="true"
              >
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
              <span>{ratingLabel}</span>
            </div>
          {/if}

          {#if show}
            <WatchedRow
              watchedProps={{
                type: 'episode',
                media: {
                  id: episode.id,
                  effectiveReleaseDate: episode.effectiveReleaseDate,
                  season: episode.season,
                  number: episode.number,
                },
                show: { id: show.id, title: show.title },
              }}
              title={intl?.title ?? episode.title}
            />
          {/if}
        </div>
      </div>

      {#if intl?.overview ?? episode.overview}
        <p class="overview">{intl?.overview ?? episode.overview}</p>
      {/if}

      <CastSection
        {cast}
        isLoading={castLoading}
        emptyMessage={m.text_no_cast()}
      />

      <CommentsSection
        type="episode"
        {slug}
        {season}
        episode={episodeNum}
        mediaId={episode.id}
        mediaTitle={intl?.title ?? episode.title}
      />
    </div>
  {/if}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .episode-page {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    background: var(--color-background);
    padding-bottom: var(--trakttime-bottom-nav-height);
  }

  .cover-hero {
    position: relative;
    height: var(--trakttime-cover-height);
    background-image: var(--cover-url);
    background-size: cover;
    background-position: center;
    flex-shrink: 0;
  }

  .cover-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.25) 0%,
      var(--color-background) 100%
    );
  }

  .cover-placeholder {
    height: var(--trakttime-avatar-size);
    flex-shrink: 0;
  }

  .episode-content {
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
    padding: 0 var(--gap-m) var(--gap-l);
    margin-top: var(--trakttime-cover-offset);
    position: relative;
  }

  .episode-header {
    display: flex;
    gap: var(--gap-m);
    align-items: flex-end;
  }

  .poster-wrap {
    flex-shrink: 0;
    width: var(--trakttime-poster-card-width);
    border-radius: var(--border-radius-m);
    overflow: hidden;
    box-shadow: 0 var(--ni-4) var(--ni-16) rgba(0, 0, 0, 0.4);
    aspect-ratio: 2 / 3;

    :global(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  .episode-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    padding-bottom: var(--gap-xs);
  }

  .episode-code-row {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
  }

  .episode-code {
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--trakttime-accent);
    text-transform: uppercase;
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

  .episode-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
    line-height: 1.3;
  }

  .episode-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-xs);
    font-size: 0.75rem;
    color: var(--color-text-secondary);

    span {
      display: inline-flex;
      align-items: center;

      &:not(:last-child)::after {
        content: '·';
        margin-left: var(--gap-xs);
      }
    }
  }

  .rating {
    display: flex;
    align-items: center;
    gap: var(--gap-xxs);
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--trakttime-accent);
  }

  .star-icon {
    width: var(--ni-14);
    height: var(--ni-14);
  }

  .overview {
    font-size: 0.9375rem;
    color: var(--color-text-primary);
    line-height: 1.6;
    margin: 0;
  }

  .loading-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: var(--trakttime-loading-top);
  }

</style>
