<script lang="ts">
  import { page } from '$app/state';
  import BackBar from '$lib/components/back-bar/BackBar.svelte';
  import PosterSkeleton from '$lib/components/poster-card/PosterSkeleton.svelte';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import { showSummaryQuery } from '$lib/requests/queries/shows/showSummaryQuery.ts';
  import { showPeopleQuery } from '$lib/requests/queries/shows/showPeopleQuery.ts';
  import { showIntlQuery } from '$lib/requests/queries/shows/showIntlQuery.ts';
  import { showSeasonsQuery } from '$lib/requests/queries/shows/showSeasonsQuery.ts';
  import SeasonEpisodes from './_internal/SeasonEpisodes.svelte';
  import SeasonListSkeleton from './_internal/SeasonListSkeleton.svelte';
  import RenderFor from '$lib/guards/RenderFor.svelte';
  import UpsellCta from '$lib/features/upsell/UpsellCta.svelte';
  import { useRelatedList } from '$lib/sections/lists/stores/useRelatedList.ts';
  import SentimentSection from '$lib/sections/summary/components/sentiment/SentimentSection.svelte';
  import TriviaSection from '$lib/sections/summary/components/trivia/TriviaSection.svelte';
  import CastSection from '$lib/sections/summary/_internal/CastSection.svelte';
  import CommentsSection from '$lib/sections/summary/_internal/CommentsSection.svelte';
  import MediaActionsRow from '$lib/sections/summary/_internal/MediaActionsRow.svelte';
  import MediaCoverHero from '$lib/sections/summary/_internal/MediaCoverHero.svelte';
  import MediaGenres from '$lib/sections/summary/_internal/MediaGenres.svelte';
  import MediaPoster from '$lib/sections/summary/_internal/MediaPoster.svelte';
  import MediaRating from '$lib/sections/summary/_internal/MediaRating.svelte';
  import SummarySkeleton from '$lib/sections/summary/_internal/SummarySkeleton.svelte';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import PosterCard from '$lib/components/poster-card/PosterCard.svelte';
  import MediaActionsSheet from '$lib/components/media-actions-sheet/MediaActionsSheet.svelte';
  import { hasAired } from '$lib/utils/media/hasAired.ts';
  import { findRegionalIntl } from '$lib/utils/media/findRegionalIntl.ts';
  import { getLanguageAndRegion, languageTag } from '$lib/features/i18n/index.ts';
  import * as m from '$lib/paraglide/messages.js';

  const slug = $derived(page.params.slug ?? '');

  let actionsOpen = $state(false);
  $effect(() => {
    slug;
    actionsOpen = false;
  });

  const query = $derived(useQuery(showSummaryQuery({ slug })));
  const show = $derived($query.data ?? null);
  const isLoading = $derived($query.isLoading);

  const peopleQuery = $derived(useQuery(showPeopleQuery({ slug })));
  const cast = $derived($peopleQuery.data?.cast ?? []);
  const castLoading = $derived($peopleQuery.isLoading);

  const seasonsQuery = $derived(useQuery(showSeasonsQuery({ slug })));
  const seasons = $derived($seasonsQuery.data ?? []);
  const seasonsLoading = $derived($seasonsQuery.isLoading);

  let openSeason = $state<number | null>(null);
  $effect(() => {
    slug;
    openSeason = null;
  });

  function toggleSeason(num: number) {
    openSeason = openSeason === num ? null : num;
  }

  const locale = $derived(languageTag());
  const region = $derived(getLanguageAndRegion());
  const intlQuery = $derived(
    useQuery(
      showIntlQuery({
        slug,
        language: region.language,
        enabled: locale !== 'en',
      }),
    ),
  );
  const intl = $derived(
    show
      ? (findRegionalIntl({
          type: 'show',
          translations: $intlQuery.data,
          fallback: {
            title: show.title,
            overview: show.overview ?? '',
            tagline: show.tagline ?? '',
          },
        }) as { title: string; overview: string; tagline: string; country: string })
      : null,
  );

  const relatedResult = $derived(useRelatedList({ type: 'show', slug, page: 1, limit: 12 }));
  const relatedList = $derived(relatedResult.list);
  const relatedLoading = $derived(relatedResult.isLoading);

  const showHasAired = $derived(
    show
      ? hasAired({
          type: 'show',
          effectiveReleaseDate: show.effectiveReleaseDate,
        })
      : false,
  );

  const ratingLabel = $derived(
    show?.rating && showHasAired ? `${(show.rating * 10).toFixed(1)} / 10` : null,
  );

  const episodeCountLabel = $derived(
    show?.episode.count ? `${show.episode.count} episodes` : null,
  );

  const statusLabel = $derived(
    show?.status.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? null,
  );

</script>

<svelte:head>
  <title>{intl?.title ? `${intl.title} - Trakt Time` : 'Trakt Time'}</title>
</svelte:head>

<div class="summary-page">
  <BackBar href="/shows/watchlist" label={m.page_title_shows()} />

  {#if isLoading && !show}
    <SummarySkeleton>
      <section class="summary-section" aria-hidden="true">
        <h2 class="summary-section-title">{m.header_seasons()}</h2>
        <SeasonListSkeleton />
      </section>
    </SummarySkeleton>
  {:else if show}
    <MediaCoverHero coverUrl={show.cover.url.medium} />

    <div class="summary-content">
      <div class="summary-header">
        <MediaPoster
          src={show.poster.url.medium}
          alt={intl?.title ?? show.title}
        />

        <div class="summary-info">
          <h1 class="summary-title">{intl?.title ?? show.title}</h1>
          <div class="summary-meta">
            {#if show.year}<span>{show.year}</span>{/if}
            {#if show.network}<span>{show.network}</span>{/if}
            {#if show.certification}
              <span class="summary-cert-badge">{show.certification}</span>
            {/if}
          </div>
          {#if statusLabel}
            <span class="status-badge" data-status={show.status}>
              {statusLabel}
            </span>
          {/if}
          {#if ratingLabel}
            <MediaRating label={ratingLabel} extraLabel={episodeCountLabel} />
          {/if}
          <MediaActionsRow
            watchedProps={{
              type: 'show',
              media: {
                id: show.id,
                effectiveReleaseDate: show.effectiveReleaseDate,
                episode: { count: show.episode.count },
              },
            }}
            title={intl?.title ?? show.title}
            onMore={() => (actionsOpen = true)}
          />
        </div>
      </div>

      <MediaGenres genres={show.genres} />

      {#if intl?.tagline ?? show.tagline}
        <p class="summary-tagline">"{intl?.tagline ?? show.tagline}"</p>
      {/if}

      {#if intl?.overview ?? show.overview}
        <p class="summary-overview">{intl?.overview ?? show.overview}</p>
      {/if}

      <RenderFor audience="vip">
        <SentimentSection type="show" {slug} />
        <TriviaSection type="show" {slug} />

        {#snippet fallback()}
          <RenderFor audience="free">
            <UpsellCta source="show-summary">
              {m.text_vip_upsell_sentiment()}
            </UpsellCta>
          </RenderFor>
        {/snippet}
      </RenderFor>

      {#if seasonsLoading && seasons.length === 0}
        <section class="summary-section" aria-hidden="true">
          <h2 class="summary-section-title">{m.header_seasons()}</h2>
          <SeasonListSkeleton />
        </section>
      {:else if seasons.length > 0}
        <section class="summary-section">
          <h2 class="summary-section-title">{m.header_seasons()}</h2>
          <ul class="seasons-list">
            {#each seasons as season (season.id)}
              <li class="season-row">
                <button
                  type="button"
                  class="season-toggle"
                  class:is-open={openSeason === season.number}
                  onclick={() => toggleSeason(season.number)}
                  aria-expanded={openSeason === season.number}
                >
                  <span class="season-label">
                    {m.text_season_number({ number: season.number })}
                  </span>
                  <span class="season-meta">{season.episodes.count} {m.text_episodes_unit()}</span>
                  <svg viewBox="0 0 24 24" class="season-chevron" fill="currentColor" aria-hidden="true">
                    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
                  </svg>
                </button>
                {#if openSeason === season.number}
                  <SeasonEpisodes
                    {slug}
                    season={season.number}
                    showId={show.id}
                    showTitle={intl?.title ?? show.title}
                    episodeCount={season.episodes.count}
                  />
                {/if}
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      <CastSection {cast} isLoading={castLoading} />

      <section class="summary-section">
        <h2 class="summary-section-title">{m.header_more_like_this()}</h2>
        {#if $relatedLoading && $relatedList.length === 0}
          <div class="poster-row" aria-hidden="true">
            {#each Array(6) as _, i (`sk-${i}`)}
              <PosterSkeleton />
            {/each}
          </div>
        {:else if $relatedList.length > 0}
          <div class="poster-row" role="list">
            {#each $relatedList as item (item.id)}
              <PosterCard
                type="show"
                href={UrlBuilder.show(item.slug)}
                id={item.id}
                title={item.title}
                posterUrl={item.poster.url.thumb}
              />
            {/each}
          </div>
        {/if}
      </section>

      <CommentsSection
        type="show"
        {slug}
        mediaId={show.id}
        mediaTitle={intl?.title ?? show.title}
      />
    </div>

    <MediaActionsSheet
      type="show"
      id={show.id}
      slug={show.slug}
      title={intl?.title ?? show.title}
      isRateable={showHasAired}
      watchedProps={{
        type: 'show',
        media: {
          id: show.id,
          effectiveReleaseDate: show.effectiveReleaseDate,
          episode: { count: show.episode.count },
        },
      }}
      isOpen={actionsOpen}
      onClose={() => (actionsOpen = false)}
    />
  {/if}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .seasons-list {
    list-style: none;
    margin: 0;
    padding: 0;
    border-radius: var(--border-radius-m);
    overflow: hidden;
    background: var(--color-card-background);
  }

  .season-row {
    border-bottom: var(--ni-1) solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }
  }

  .season-toggle {
    width: 100%;
    background: none;
    border: none;
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    padding: var(--gap-s) var(--gap-m);
    cursor: pointer;
    text-align: left;
    -webkit-tap-highlight-color: transparent;
  }

  .season-label {
    font-weight: 600;
    font-size: 0.9375rem;
  }

  .season-meta {
    flex: 1;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
  }

  .season-chevron {
    width: var(--ni-18);
    height: var(--ni-18);
    color: var(--color-text-secondary);
    transition: transform var(--transition-increment) ease-in-out;
  }

  .season-toggle.is-open .season-chevron {
    transform: rotate(180deg);
  }

  .status-badge {
    display: inline-block;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: var(--gap-xxs) var(--gap-xs);
    border-radius: var(--border-radius-s);
    text-transform: uppercase;
    width: fit-content;

    &[data-status='returning series'] {
      background: color-mix(in srgb, var(--green-500) 20%, transparent);
      color: var(--green-500);
    }

    &[data-status='ended'],
    &[data-status='canceled'] {
      background: color-mix(in srgb, var(--red-500) 20%, transparent);
      color: var(--red-500);
    }

    &[data-status='in production'] {
      background: color-mix(in srgb, var(--blue-500) 20%, transparent);
      color: var(--blue-500);
    }

    &:not([data-status='returning series']):not([data-status='ended']):not([data-status='canceled']):not([data-status='in production']) {
      background: color-mix(in srgb, var(--color-text-secondary) 15%, transparent);
      color: var(--color-text-secondary);
    }
  }

  .poster-row {
    @include scrollable-row;
    margin: 0 calc(-1 * var(--gap-m));
    padding: 0 var(--gap-m);
  }

</style>
