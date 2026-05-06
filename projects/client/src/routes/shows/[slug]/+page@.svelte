<script lang="ts">
  import { page } from '$app/state';
  import CrossOriginImage from '$lib/features/image/components/CrossOriginImage.svelte';
  import BackBar from '$lib/components/back-bar/BackBar.svelte';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import LoadMoreButton from '$lib/components/load-more-button/LoadMoreButton.svelte';
  import PosterSkeleton from '$lib/components/poster-card/PosterSkeleton.svelte';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import { showSummaryQuery } from '$lib/requests/queries/shows/showSummaryQuery.ts';
  import { showPeopleQuery } from '$lib/requests/queries/shows/showPeopleQuery.ts';
  import { showIntlQuery } from '$lib/requests/queries/shows/showIntlQuery.ts';
  import { showSeasonsQuery } from '$lib/requests/queries/shows/showSeasonsQuery.ts';
  import SeasonEpisodes from './_internal/SeasonEpisodes.svelte';
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

  const query = $derived(useQuery(showSummaryQuery({ slug })));
  const show = $derived($query.data ?? null);
  const isLoading = $derived($query.isLoading);

  const peopleQuery = $derived(useQuery(showPeopleQuery({ slug })));
  const cast = $derived($peopleQuery.data?.cast.slice(0, 10) ?? []);
  const castLoading = $derived($peopleQuery.isLoading);

  const seasonsQuery = $derived(useQuery(showSeasonsQuery({ slug })));
  const seasons = $derived($seasonsQuery.data ?? []);

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

  const commentsResult = $derived(useComments({ type: 'show', slug, sort: 'likes', limit: 5 }));
  const commentList = $derived(commentsResult.list);
  const commentsLoading = $derived(commentsResult.isLoading);
  const commentsHasNextPage = $derived(commentsResult.hasNextPage);
  const commentsFetchNext = $derived(commentsResult.fetchNextPage);

  const { onDelete: onDeleteComment } = useCommentDeleteAction({ type: 'show' });

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

<div class="media-page">
  <BackBar href="/shows/watchlist" label={m.page_title_shows()} />

  {#if isLoading && !show}
    <div class="loading-state">
      <LoadingIndicator />
    </div>
  {:else if show}
    <div class="cover-hero" style:--cover-url="url({show.cover.url.medium})">
      <div class="cover-gradient"></div>
    </div>

    <div class="media-content">
      <div class="media-header">
        <div class="poster-wrap">
          <CrossOriginImage
            src={show.poster.url.medium}
            alt={intl?.title ?? show.title}
            classList="poster-img"
          />
        </div>

        <div class="media-info">
          <h1 class="media-title">{intl?.title ?? show.title}</h1>
          <div class="media-meta">
            {#if show.year}<span>{show.year}</span>{/if}
            {#if show.network}<span>{show.network}</span>{/if}
            {#if show.certification}<span class="cert-badge">{show.certification}</span>{/if}
          </div>
          {#if statusLabel}
            <span class="status-badge" data-status={show.status}>
              {statusLabel}
            </span>
          {/if}
          {#if ratingLabel}
            <div class="rating">
              <svg viewBox="0 0 24 24" fill="currentColor" class="star-icon" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>{ratingLabel}</span>
              {#if episodeCountLabel}<span class="episode-count">{episodeCountLabel}</span>{/if}
            </div>
          {/if}
          <WatchedRow
            watchedProps={{
              type: 'show',
              media: {
                id: show.id,
                effectiveReleaseDate: show.effectiveReleaseDate,
                episode: { count: show.episode.count },
              },
            }}
            title={intl?.title ?? show.title}
          />

          <button class="actions-btn" onclick={() => (actionsOpen = true)} aria-label={m.header_rate_or_favorite()}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {m.button_text_rate_or_favorite()}
          </button>
        </div>
      </div>

      {#if show.genres.length > 0}
        <div class="genres" role="list">
          {#each show.genres.slice(0, 4) as genre (genre)}
            <span class="genre-pill" role="listitem">{toTranslatedGenre(genre)}</span>
          {/each}
        </div>
      {/if}

      {#if intl?.tagline ?? show.tagline}
        <p class="tagline">"{intl?.tagline ?? show.tagline}"</p>
      {/if}

      {#if intl?.overview ?? show.overview}
        <p class="overview">{intl?.overview ?? show.overview}</p>
      {/if}

      {#if seasons.length > 0}
        <section class="media-section">
          <h2 class="section-title">{m.header_seasons()}</h2>
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
                  />
                {/if}
              </li>
            {/each}
          </ul>
        </section>
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
      type="show"
      mediaId={show.id}
      title={intl?.title ?? show.title}
      isOpen={commentsOpen}
      onClose={() => (commentsOpen = false)}
    />

    {#if threadComment}
      <CommentThreadDrawer
        type="show"
        comment={threadComment}
        onClose={() => (threadComment = null)}
      />
    {/if}

    <MediaActionsSheet
      type="show"
      id={show.id}
      slug={show.slug}
      title={intl?.title ?? show.title}
      isRateable={showHasAired}
      isOpen={actionsOpen}
      onClose={() => (actionsOpen = false)}
    />
  {/if}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

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

  .rating {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--trakttime-accent);
  }

  .star-icon {
    width: var(--ni-14);
    height: var(--ni-14);
    color: var(--trakttime-accent);
  }

  .episode-count {
    font-weight: 400;
    color: var(--color-text-secondary);
    font-size: 0.75rem;
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
    text-decoration: none;
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
