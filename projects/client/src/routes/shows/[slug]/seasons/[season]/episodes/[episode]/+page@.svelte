<script lang="ts">
  import SeoHead from '$lib/features/seo/SeoHead.svelte';
  import { toEpisodeSeo } from '$lib/features/seo/media/toEpisodeSeo.ts';
  import type { PageProps } from './$types.ts';
  import { page } from '$app/state';
  import BackBar from '$lib/components/back-bar/BackBar.svelte';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import { episodeSummaryQuery } from '$lib/requests/queries/episode/episodeSummaryQuery.ts';
  import { episodeIntlQuery } from '$lib/requests/queries/episode/episodeIntlQuery.ts';
  import { episodePeopleQuery } from '$lib/requests/queries/episode/episodePeopleQuery.ts';
  import { showSummaryQuery } from '$lib/requests/queries/shows/showSummaryQuery.ts';
  import { showSeasonsQuery } from '$lib/requests/queries/shows/showSeasonsQuery.ts';
  import ChevronRightIcon from '$lib/components/icons/ChevronRightIcon.svelte';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import { toAdjacentEpisodes } from './_internal/toAdjacentEpisodes.ts';
  import EpisodeRating from './_internal/EpisodeRating.svelte';
  import RenderFor from '$lib/guards/RenderFor.svelte';
  import {
    EpisodeFinaleType,
    EpisodePremiereType,
  } from '$lib/requests/models/EpisodeType.ts';
  import { findRegionalIntl } from '$lib/utils/media/findRegionalIntl.ts';
  import { getLanguageAndRegion, languageTag } from '$lib/features/i18n/index.ts';
  import CastSection from '$lib/sections/summary/_internal/CastSection.svelte';
  import CommentsSection from '$lib/sections/summary/_internal/CommentsSection.svelte';
  import MediaActionsRow from '$lib/sections/summary/_internal/MediaActionsRow.svelte';
  import MediaCoverHero from '$lib/sections/summary/_internal/MediaCoverHero.svelte';
  import MediaRating from '$lib/sections/summary/_internal/MediaRating.svelte';
  import SummarySkeleton from '$lib/sections/summary/_internal/SummarySkeleton.svelte';
  import { hasAired } from '$lib/utils/media/hasAired.ts';
  import * as m from '$lib/paraglide/messages.js';

  const { data }: PageProps = $props();

  const slug = $derived(page.params.slug ?? '');
  const season = $derived(Number(page.params.season ?? 0));
  const episodeNum = $derived(Number(page.params.episode ?? 0));

  const episodeQuery = $derived(
    useQuery(episodeSummaryQuery({ slug, season, episode: episodeNum })),
  );

  const showQuery = $derived(useQuery(showSummaryQuery({ slug })));
  const seasonsQuery = $derived(useQuery(showSeasonsQuery({ slug })));
  const adjacent = $derived(
    toAdjacentEpisodes({
      current: { season, episode: episodeNum },
      seasons: $seasonsQuery.data ?? [],
    }),
  );

  const peopleQuery = $derived(
    useQuery(episodePeopleQuery({ slug, season, episode: episodeNum })),
  );
  const cast = $derived($peopleQuery.data?.cast ?? []);
  const castLoading = $derived($peopleQuery.isLoading);

  const episode = $derived($episodeQuery.data ?? null);
  const show = $derived($showQuery.data ?? null);
  const isLoading = $derived(
    ($episodeQuery.isLoading && !episode) || ($showQuery.isLoading && !show),
  );

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

  const episodeWatchedProps = $derived(
    episode && show
      ? {
        type: 'episode' as const,
        media: {
          id: episode.id,
          effectiveReleaseDate: episode.effectiveReleaseDate,
          season: episode.season,
          number: episode.number,
        },
        show: { id: show.id, title: show.title },
      }
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

  const ratingScore = $derived(
    episode?.rating && episodeHasAired ? episode.rating : null,
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

<SeoHead
  {...toEpisodeSeo({
    episode: episode ?? data.crawlerEpisode,
    show: show ?? data.crawlerShow,
    title: intl?.title,
    overview: intl?.overview,
    url: `${page.url.origin}${page.url.pathname}`,
    showUrl: `${page.url.origin}${showUrl}`,
  })}
/>

<div class="summary-page">
  <BackBar href={showUrl} label={show?.title ?? ''} variant="overlay" />

  {#if isLoading}
    <SummarySkeleton variant="episode" />
  {:else if episode}
    <MediaCoverHero {coverUrl} />

    <div class="summary-content">
      <div class="summary-header">
        <div class="summary-info">
          {#if show}
            <a href={showUrl} class="summary-show-link">{show.title}</a>
          {/if}
          <div class="episode-code-row">
            {#if adjacent.previous}
              <a
                class="episode-step is-previous"
                href={UrlBuilder.episode(slug, adjacent.previous.season, adjacent.previous.episode)}
                data-sveltekit-replacestate
                aria-label={m.button_label_previous_episode()}
              >
                <ChevronRightIcon />
              </a>
            {:else}
              <span class="episode-step" aria-hidden="true"></span>
            {/if}
            <span class="episode-code">{seasonLabel} {episodeLabel}</span>
            {#if adjacent.next}
              <a
                class="episode-step"
                href={UrlBuilder.episode(slug, adjacent.next.season, adjacent.next.episode)}
                data-sveltekit-replacestate
                aria-label={m.button_label_next_episode()}
              >
                <ChevronRightIcon />
              </a>
            {:else}
              <span class="episode-step" aria-hidden="true"></span>
            {/if}
            {#if badgeLabel}
              <span class="episode-badge">{badgeLabel}</span>
            {/if}
          </div>

          <h1 class="summary-title">{intl?.title ?? episode.title}</h1>

          <div class="summary-meta">
            {#if airDateLabel}<span>{airDateLabel}</span>{/if}
            {#if duration}<span>{duration}</span>{/if}
          </div>

          {#if ratingScore}
            <MediaRating score={ratingScore} />
          {/if}
        </div>
      </div>

      {#if episodeWatchedProps}
        <MediaActionsRow
          watchedProps={episodeWatchedProps}
          title={intl?.title ?? episode.title}
        />
        {#if episodeHasAired}
          <RenderFor audience="authenticated">
            <EpisodeRating id={episodeWatchedProps.media.id} watchedProps={episodeWatchedProps} />
          </RenderFor>
        {/if}
      {/if}

      {#if intl?.overview ?? episode.overview}
        <p class="summary-overview">{intl?.overview ?? episode.overview}</p>
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
  .episode-code-row {
    display: flex;
    align-items: center;
    gap: var(--gap-xxs);
    margin-inline: calc(-1 * var(--gap-xs));
  }

  .episode-code {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--trakttime-accent);
    font-variant-numeric: tabular-nums;
  }

  .episode-step {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ni-28);
    height: var(--ni-28);
    border-radius: 50%;
    color: var(--color-text-secondary);
    -webkit-tap-highlight-color: transparent;

    &:is(a):hover,
    &:is(a):focus-visible {
      color: var(--trakttime-accent);
      background: color-mix(in srgb, var(--trakttime-accent) 12%, transparent);
    }

    &.is-previous :global(svg) {
      transform: rotate(180deg);
    }

    :global(svg) {
      width: var(--ni-16);
      height: var(--ni-16);
    }
  }

  .summary-show-link {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-decoration: none;
  }
</style>
