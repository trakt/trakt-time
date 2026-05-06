<script lang="ts">
  import { page } from '$app/state';
  import CrossOriginImage from '$lib/features/image/components/CrossOriginImage.svelte';
  import BackBar from '$lib/components/back-bar/BackBar.svelte';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import LoadMoreButton from '$lib/components/load-more-button/LoadMoreButton.svelte';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import { episodeSummaryQuery } from '$lib/requests/queries/episode/episodeSummaryQuery.ts';
  import { episodeIntlQuery } from '$lib/requests/queries/episode/episodeIntlQuery.ts';
  import { showSummaryQuery } from '$lib/requests/queries/shows/showSummaryQuery.ts';
  import { EpisodeFinaleType, EpisodePremiereType } from '$lib/requests/models/EpisodeType.ts';
  import { findRegionalIntl } from '$lib/utils/media/findRegionalIntl.ts';
  import { getLanguageAndRegion, languageTag } from '$lib/features/i18n/index.ts';
  import { useComments } from '$lib/sections/summary/components/comments/_internal/useComments.ts';
  import CommentCard from '$lib/components/comment-card/CommentCard.svelte';
  import AddCommentDrawer from '$lib/components/comment-drawer/AddCommentDrawer.svelte';
  import CommentThreadDrawer from '$lib/components/comment-drawer/CommentThreadDrawer.svelte';
  import type { MediaComment } from '$lib/requests/models/MediaComment.ts';
  import { useCommentDeleteAction } from '$lib/sections/summary/components/comments/_internal/useCommentDeleteAction.ts';
  import WatchedRow from '$lib/components/watched-row/WatchedRow.svelte';
  import RenderFor from '$lib/guards/RenderFor.svelte';
  import { hasAired } from '$lib/utils/media/hasAired.ts';
  import * as m from '$lib/paraglide/messages.js';

  const slug = page.params.slug ?? '';
  const season = Number(page.params.season ?? 0);
  const episodeNum = Number(page.params.episode ?? 0);

  let commentsOpen = $state(false);
  let threadComment = $state<MediaComment | null>(null);

  const episodeQuery = $derived(
    useQuery(episodeSummaryQuery({ slug, season, episode: episodeNum })),
  );

  const commentsResult = $derived(
    useComments({
      type: 'episode',
      slug,
      season,
      episode: episodeNum,
      id: $episodeQuery.data?.id ?? 0,
      sort: 'likes',
      limit: 5,
    }),
  );
  const commentList = $derived(commentsResult.list);
  const commentsLoading = $derived(commentsResult.isLoading);
  const commentsHasNextPage = $derived(commentsResult.hasNextPage);
  const commentsFetchNext = $derived(commentsResult.fetchNextPage);

  const { onDelete: onDeleteComment } = useCommentDeleteAction({ type: 'episode' });

  const showQuery = $derived(useQuery(showSummaryQuery({ slug })));

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
      type="episode"
      mediaId={episode.id}
      title={intl?.title ?? episode.title}
      isOpen={commentsOpen}
      onClose={() => (commentsOpen = false)}
    />

    {#if threadComment}
      <CommentThreadDrawer
        type="episode"
        comment={threadComment}
        onClose={() => (threadComment = null)}
      />
    {/if}
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

  .comments-list {
    display: flex;
    flex-direction: column;
  }

</style>
