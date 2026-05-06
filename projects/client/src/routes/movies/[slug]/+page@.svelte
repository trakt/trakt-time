<script lang="ts">
  import { page } from '$app/state';
  import CrossOriginImage from '$lib/features/image/components/CrossOriginImage.svelte';
  import BackBar from '$lib/components/back-bar/BackBar.svelte';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import LoadMoreButton from '$lib/components/load-more-button/LoadMoreButton.svelte';
  import PosterSkeleton from '$lib/components/poster-card/PosterSkeleton.svelte';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import { movieSummaryQuery } from '$lib/requests/queries/movies/movieSummaryQuery.ts';
  import { moviePeopleQuery } from '$lib/requests/queries/movies/moviePeopleQuery.ts';
  import { movieIntlQuery } from '$lib/requests/queries/movies/movieIntlQuery.ts';
  import { useRelatedList } from '$lib/sections/lists/stores/useRelatedList.ts';
  import { useComments } from '$lib/sections/summary/components/comments/_internal/useComments.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import CommentCard from '$lib/components/comment-card/CommentCard.svelte';
  import CommentThreadDrawer from '$lib/components/comment-drawer/CommentThreadDrawer.svelte';
  import type { MediaComment } from '$lib/requests/models/MediaComment.ts';
  import { useCommentDeleteAction } from '$lib/sections/summary/components/comments/_internal/useCommentDeleteAction.ts';
  import PosterCard from '$lib/components/poster-card/PosterCard.svelte';
  import MediaActionsSheet from '$lib/components/media-actions-sheet/MediaActionsSheet.svelte';
  import AddCommentDrawer from '$lib/components/comment-drawer/AddCommentDrawer.svelte';
  import WatchedRow from '$lib/components/watched-row/WatchedRow.svelte';
  import RenderFor from '$lib/guards/RenderFor.svelte';
  import { hasAired } from '$lib/utils/media/hasAired.ts';
  import { toTranslatedGenre } from '$lib/utils/formatting/string/toTranslatedGenre.ts';
  import { findRegionalIntl } from '$lib/utils/media/findRegionalIntl.ts';
  import { getLanguageAndRegion, languageTag } from '$lib/features/i18n/index.ts';
  import * as m from '$lib/paraglide/messages.js';

  const slug = $derived(page.params.slug ?? '');

  let actionsOpen = $state(false);
  let commentsOpen = $state(false);
  let threadComment = $state<MediaComment | null>(null);
  $effect(() => {
    slug;
    actionsOpen = false;
    commentsOpen = false;
    threadComment = null;
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
  const cast = $derived($peopleQuery.data?.cast.slice(0, 10) ?? []);
  const castLoading = $derived($peopleQuery.isLoading);

  const relatedResult = $derived(useRelatedList({ type: 'movie', slug, page: 1, limit: 12 }));
  const relatedList = $derived(relatedResult.list);
  const relatedLoading = $derived(relatedResult.isLoading);

  const commentsResult = $derived(useComments({ type: 'movie', slug, sort: 'likes', limit: 5 }));
  const commentList = $derived(commentsResult.list);
  const commentsLoading = $derived(commentsResult.isLoading);
  const commentsHasNextPage = $derived(commentsResult.hasNextPage);
  const commentsFetchNext = $derived(commentsResult.fetchNextPage);

  const { onDelete: onDeleteComment } = useCommentDeleteAction({ type: 'movie' });

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

<div class="media-page">
  <BackBar href="/movies/watchlist" label={m.page_title_movies()} />

  {#if isLoading && !movie}
    <div class="loading-state">
      <LoadingIndicator />
    </div>
  {:else if movie}
    <div class="cover-hero" style:--cover-url="url({movie.cover.url.medium})">
      <div class="cover-gradient"></div>
    </div>

    <div class="media-content">
      <div class="media-header">
        <div class="poster-wrap">
          <CrossOriginImage
            src={movie.poster.url.medium}
            alt={intl?.title ?? movie.title}
            classList="poster-img"
          />
        </div>

        <div class="media-info">
          <h1 class="media-title">{intl?.title ?? movie.title}</h1>
          <div class="media-meta">
            {#if movie.year}<span>{movie.year}</span>{/if}
            {#if duration}<span>{duration}</span>{/if}
            {#if movie.certification}<span class="cert-badge">{movie.certification}</span>{/if}
          </div>
          {#if ratingLabel}
            <div class="rating">
              <svg viewBox="0 0 24 24" fill="currentColor" class="star-icon" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>{ratingLabel}</span>
            </div>
          {/if}
          <WatchedRow
            watchedProps={{
              type: 'movie',
              media: {
                id: movie.id,
                effectiveReleaseDate: movie.effectiveReleaseDate,
                status: movie.status,
              },
            }}
            title={intl?.title ?? movie.title}
          />

          <button class="actions-btn" onclick={() => (actionsOpen = true)} aria-label={m.header_rate_or_favorite()}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {m.button_text_rate_or_favorite()}
          </button>
        </div>
      </div>

      {#if movie.genres.length > 0}
        <div class="genres" role="list">
          {#each movie.genres.slice(0, 4) as genre (genre)}
            <span class="genre-pill" role="listitem">{toTranslatedGenre(genre)}</span>
          {/each}
        </div>
      {/if}

      {#if intl?.tagline ?? movie.tagline}
        <p class="tagline">"{intl?.tagline ?? movie.tagline}"</p>
      {/if}

      {#if intl?.overview ?? movie.overview}
        <p class="overview">{intl?.overview ?? movie.overview}</p>
      {/if}

      <section class="media-section">
        <h2 class="section-title">{m.header_cast()}</h2>
        {#if castLoading && cast.length === 0}
          <div class="cast-row" aria-hidden="true">
            {#each Array(6) as _, i (`csk-${i}`)}
              <div class="cast-skeleton">
                <div class="cast-skeleton-avatar"></div>
                <div class="cast-skeleton-line cast-skeleton-line--name"></div>
                <div class="cast-skeleton-line cast-skeleton-line--char"></div>
              </div>
            {/each}
          </div>
        {:else if cast.length > 0}
          <div class="cast-row" role="list">
            {#each cast as member (member.key)}
              <a href="/people/{member.key}" class="cast-member">
                <div class="cast-avatar">
                  {#if member.headshot.url.thumb}
                    <CrossOriginImage src={member.headshot.url.thumb} alt={member.name} />
                  {:else}
                    <div class="cast-avatar-placeholder">{member.name.charAt(0)}</div>
                  {/if}
                </div>
                <p class="cast-name">{member.name}</p>
                <p class="cast-character">{member.characterName}</p>
              </a>
            {/each}
          </div>
        {/if}
      </section>

      <section class="media-section">
        <h2 class="section-title">{m.header_more_like_this()}</h2>
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

      <section class="media-section">
        <div class="section-header-row">
          <h2 class="section-title">{m.list_title_comments()}</h2>
          <RenderFor audience="authenticated">
            <button
              type="button"
              class="add-comment-btn"
              onclick={() => (commentsOpen = true)}
              aria-label={m.button_label_add_new_comment()}
            >
              + {m.button_text_add_comment_short()}
            </button>
          </RenderFor>
        </div>
        {#if $commentsLoading && $commentList.length === 0}
          <div class="section-loading"><LoadingIndicator /></div>
        {:else if $commentList.length > 0}
          <div class="comments-list">
            {#each $commentList as comment (comment.key)}
              <CommentCard
                {comment}
                onOpenThread={(c) => (threadComment = c)}
                onDelete={onDeleteComment}
              />
            {/each}
          </div>
          {#if $commentsHasNextPage}
            <LoadMoreButton
              loading={$commentsLoading}
              onclick={commentsFetchNext}
              label={m.button_text_load_more()}
            />
          {/if}
        {/if}
      </section>
    </div>

    <AddCommentDrawer
      type="movie"
      mediaId={movie.id}
      title={intl?.title ?? movie.title}
      isOpen={commentsOpen}
      onClose={() => (commentsOpen = false)}
    />

    {#if threadComment}
      <CommentThreadDrawer
        type="movie"
        comment={threadComment}
        onClose={() => (threadComment = null)}
      />
    {/if}

    <MediaActionsSheet
      type="movie"
      id={movie.id}
      slug={movie.slug}
      title={intl?.title ?? movie.title}
      isRateable={movieHasAired}
      isOpen={actionsOpen}
      onClose={() => (actionsOpen = false)}
    />
  {/if}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .media-page {
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
    background-position: center top;
    flex-shrink: 0;
  }

  .cover-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.2) 0%,
      var(--color-background) 100%
    );
  }

  .media-content {
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
    padding: 0 var(--gap-m) var(--gap-l);
    margin-top: var(--trakttime-cover-offset);
    position: relative;
  }

  .media-header {
    display: flex;
    gap: var(--gap-m);
    align-items: stretch;
  }

  .poster-wrap {
    flex-shrink: 0;
    aspect-ratio: 2 / 3;
    min-width: var(--trakttime-poster-card-width);
    max-width: calc(var(--trakttime-poster-card-width) * 1.6);
    border-radius: var(--border-radius-m);
    overflow: hidden;
    box-shadow: 0 var(--ni-4) var(--ni-16) rgba(0, 0, 0, 0.4);
    align-self: stretch;

    :global(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  .media-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    padding-bottom: var(--gap-xs);
  }

  .actions-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--gap-xs);
    background: color-mix(in srgb, var(--trakttime-accent) 15%, transparent);
    border: var(--ni-1) solid color-mix(in srgb, var(--trakttime-accent) 40%, transparent);
    border-radius: var(--border-radius-s);
    color: var(--trakttime-accent);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    padding: var(--gap-xxs) var(--gap-s);
    cursor: pointer;
    margin-top: var(--gap-xxs);
    width: fit-content;

    svg {
      width: 13px;
      height: 13px;
    }
  }

  .media-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
    line-height: 1.3;
  }

  .media-meta {
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

  .cert-badge {
    border: var(--ni-1) solid var(--color-text-secondary);
    padding: 0 var(--gap-xxs);
    border-radius: var(--ni-2);
    font-size: 0.65rem;
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
    color: var(--trakttime-accent);
  }

  .genres {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-xs);
  }

  .genre-pill {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    padding: var(--gap-xxs) var(--gap-s);
    border-radius: var(--border-radius-m);
    background: color-mix(in srgb, var(--trakttime-accent) 15%, transparent);
    color: var(--trakttime-accent);
    text-transform: uppercase;
  }

  .tagline {
    font-size: 0.875rem;
    font-style: italic;
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.5;
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


  .section-loading {
    display: flex;
    justify-content: center;
    padding: var(--gap-m) 0;
  }

  .media-section {
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);
  }

  .section-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--gap-s);
  }

  .add-comment-btn {
    background: none;
    border: var(--ni-1) solid var(--trakttime-accent);
    color: var(--trakttime-accent);
    border-radius: var(--border-radius-xxl);
    font-size: 0.75rem;
    font-weight: 600;
    padding: var(--ni-4) var(--ni-10);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
  }

  .cast-row {
    @include scrollable-row(var(--gap-m));
    margin: 0 calc(-1 * var(--gap-m));
    padding: 0 var(--gap-m);
  }

  .cast-member {
    flex-shrink: 0;
    width: 68px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .cast-avatar {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--color-card-background);
    border: var(--ni-1) solid var(--color-border);

    :global(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  .cast-avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-secondary);
  }

  .cast-name {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cast-character {
    font-size: 0.625rem;
    color: var(--color-text-secondary);
    margin: 0;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cast-skeleton {
    flex-shrink: 0;
    width: 68px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
  }

  .cast-skeleton-avatar {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    @include shimmer-bg;
  }

  .cast-skeleton-line {
    border-radius: var(--border-radius-s);
    @include shimmer-bg;

    &--name {
      width: var(--ni-56);
      height: 0.6875rem;
      animation-delay: 0.1s;
    }

    &--char {
      width: var(--ni-44);
      height: 0.625rem;
      animation-delay: 0.2s;
    }
  }

  .poster-row {
    @include scrollable-row;
    margin: 0 calc(-1 * var(--gap-m));
    padding: 0 var(--gap-m);
  }

  .comments-list {
    display: flex;
    flex-direction: column;
  }

</style>
