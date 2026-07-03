<script lang="ts">
  import { page } from '$app/state';
  import BackBar from '$lib/components/back-bar/BackBar.svelte';
  import PosterSkeleton from '$lib/components/poster-card/PosterSkeleton.svelte';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import { movieSummaryQuery } from '$lib/requests/queries/movies/movieSummaryQuery.ts';
  import { moviePeopleQuery } from '$lib/requests/queries/movies/moviePeopleQuery.ts';
  import { movieIntlQuery } from '$lib/requests/queries/movies/movieIntlQuery.ts';
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

  const query = $derived(useQuery(movieSummaryQuery({ slug })));
  const movie = $derived($query.data ?? null);
  const isLoading = $derived($query.isLoading);

  const locale = $derived(languageTag());
  const region = $derived(getLanguageAndRegion());
  const intlQuery = $derived(
    useQuery(
      movieIntlQuery({
        slug,
        language: region.language,
        enabled: locale !== 'en',
      }),
    ),
  );
  const intl = $derived(
    movie
      ? (findRegionalIntl({
          type: 'movie',
          translations: $intlQuery.data,
          fallback: {
            title: movie.title,
            overview: movie.overview ?? '',
            tagline: movie.tagline ?? '',
          },
        }) as { title: string; overview: string; tagline: string; country: string })
      : null,
  );

  const peopleQuery = $derived(useQuery(moviePeopleQuery({ slug })));
  const cast = $derived($peopleQuery.data?.cast ?? []);
  const castLoading = $derived($peopleQuery.isLoading);

  const relatedResult = $derived(useRelatedList({ type: 'movie', slug, page: 1, limit: 12 }));
  const relatedList = $derived(relatedResult.list);
  const relatedLoading = $derived(relatedResult.isLoading);


  const duration = $derived(
    movie && movie.runtime > 0
      ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
      : null,
  );

  const movieHasAired = $derived(
    movie
      ? hasAired({
          type: 'movie',
          effectiveReleaseDate: movie.effectiveReleaseDate,
          status: movie.status,
        })
      : false,
  );

  const ratingLabel = $derived(
    movie?.rating && movieHasAired
      ? `${(movie.rating * 10).toFixed(1)} / 10`
      : null,
  );

</script>

<svelte:head>
  <title>{intl?.title ? `${intl.title} - Trakt Time` : 'Trakt Time'}</title>
</svelte:head>

<div class="summary-page">
  <BackBar href="/movies/watchlist" label={m.page_title_movies()} />

  {#if isLoading && !movie}
    <SummarySkeleton />
  {:else if movie}
    <MediaCoverHero coverUrl={movie.cover.url.medium} />

    <div class="summary-content">
      <div class="summary-header">
        <MediaPoster
          src={movie.poster.url.medium}
          alt={intl?.title ?? movie.title}
        />

        <div class="summary-info">
          <h1 class="summary-title">{intl?.title ?? movie.title}</h1>
          <div class="summary-meta">
            {#if movie.year}<span>{movie.year}</span>{/if}
            {#if duration}<span>{duration}</span>{/if}
            {#if movie.certification}
              <span class="summary-cert-badge">{movie.certification}</span>
            {/if}
          </div>
          {#if ratingLabel}
            <MediaRating label={ratingLabel} />
          {/if}
          <MediaActionsRow
            watchedProps={{
              type: 'movie',
              media: {
                id: movie.id,
                effectiveReleaseDate: movie.effectiveReleaseDate,
                status: movie.status,
              },
            }}
            title={intl?.title ?? movie.title}
            onMore={() => (actionsOpen = true)}
          />
        </div>
      </div>

      <MediaGenres genres={movie.genres} />

      {#if intl?.tagline ?? movie.tagline}
        <p class="summary-tagline">"{intl?.tagline ?? movie.tagline}"</p>
      {/if}

      {#if intl?.overview ?? movie.overview}
        <p class="summary-overview">{intl?.overview ?? movie.overview}</p>
      {/if}

      <RenderFor audience="vip">
        <SentimentSection type="movie" {slug} />
        <TriviaSection type="movie" {slug} />

        {#snippet fallback()}
          <RenderFor audience="free">
            <UpsellCta source="movie-summary">
              {m.text_vip_upsell_sentiment()}
            </UpsellCta>
          </RenderFor>
        {/snippet}
      </RenderFor>

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
                type="movie"
                href={UrlBuilder.movie(item.slug)}
                id={item.id}
                title={item.title}
                posterUrl={item.poster.url.thumb}
              />
            {/each}
          </div>
        {/if}
      </section>

      <CommentsSection
        type="movie"
        {slug}
        mediaId={movie.id}
        mediaTitle={intl?.title ?? movie.title}
      />
    </div>

    <MediaActionsSheet
      type="movie"
      id={movie.id}
      slug={movie.slug}
      title={intl?.title ?? movie.title}
      isRateable={movieHasAired}
      watchedProps={{
        type: 'movie',
        media: {
          id: movie.id,
          effectiveReleaseDate: movie.effectiveReleaseDate,
          status: movie.status,
        },
      }}
      isOpen={actionsOpen}
      onClose={() => (actionsOpen = false)}
    />
  {/if}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .poster-row {
    @include scrollable-row;
    margin: 0 calc(-1 * var(--gap-m));
    padding: 0 var(--gap-m);
  }
</style>
