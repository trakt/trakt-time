<script lang="ts">
  import CommentCard from '$lib/components/comment-card/CommentCard.svelte';
  import CommentCardSkeleton from '$lib/components/comment-card/CommentCardSkeleton.svelte';
  import AddCommentDrawer from '$lib/components/comment-drawer/AddCommentDrawer.svelte';
  import CommentThreadDrawer from '$lib/components/comment-drawer/CommentThreadDrawer.svelte';
  import InfiniteScrollTrigger from '$lib/components/infinite-scroll/InfiniteScrollTrigger.svelte';
  import RenderFor from '$lib/guards/RenderFor.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { MediaComment } from '$lib/requests/models/MediaComment.ts';
  import { useCommentDeleteAction } from '$lib/sections/summary/components/comments/_internal/useCommentDeleteAction.ts';
  import { useComments } from '$lib/sections/summary/components/comments/_internal/useComments.ts';

  type CommonProps = {
    slug: string;
    mediaId: number;
    mediaTitle: string;
    limit?: number;
  };

  type Props =
    & CommonProps
    & (
      | { type: 'movie' | 'show' }
      | { type: 'episode'; season: number; episode: number }
    );

  const props: Props = $props();
  const limit = $derived(props.limit ?? 5);

  let commentsOpen = $state(false);
  let threadComment = $state<MediaComment | null>(null);

  const commentsResult = $derived(
    props.type === 'episode'
      ? useComments({
        type: 'episode',
        slug: props.slug,
        season: props.season,
        episode: props.episode,
        id: props.mediaId,
        sort: 'likes',
        limit,
      })
      : useComments({
        type: props.type,
        slug: props.slug,
        sort: 'likes',
        limit,
      }),
  );

  const commentList = $derived(commentsResult.list);
  const commentsLoading = $derived(commentsResult.isLoading);
  const commentsHasNextPage = $derived(commentsResult.hasNextPage);
  const commentsFetchNext = $derived(commentsResult.fetchNextPage);

  const { onDelete: onDeleteComment } = $derived(
    useCommentDeleteAction({ type: props.type }),
  );

  const PREVIEW_COUNT = 3;

  let showAll = $state(false);
  $effect(() => {
    props.slug;
    showAll = false;
  });

  const visibleComments = $derived(
    showAll ? $commentList : $commentList.slice(0, PREVIEW_COUNT),
  );
  const hasMoreComments = $derived(
    $commentList.length > PREVIEW_COUNT || $commentsHasNextPage,
  );
</script>

<section class="media-section">
  <div class="section-header-row">
    <h2 class="summary-section-title">{m.list_title_comments()}</h2>
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
    <div class="comments-list" aria-hidden="true">
      {#each Array(PREVIEW_COUNT) as _, i (`cs-${i}`)}
        <CommentCardSkeleton />
      {/each}
    </div>
  {:else if $commentList.length > 0}
    <div class="comments-list">
      {#each visibleComments as comment (comment.key)}
        <CommentCard
          {comment}
          onOpenThread={(c) => (threadComment = c)}
          onDelete={onDeleteComment}
        />
      {/each}
    </div>
    {#if showAll}
      <InfiniteScrollTrigger
        hasMore={$commentsHasNextPage}
        isLoading={$commentsLoading}
        count={$commentList.length}
        onload={commentsFetchNext}
      />
    {:else if hasMoreComments}
      <button
        type="button"
        class="see-all-btn"
        onclick={() => (showAll = true)}
      >
        {m.button_text_see_all_reviews()}
      </button>
    {/if}
  {/if}
</section>

<AddCommentDrawer
  type={props.type}
  mediaId={props.mediaId}
  title={props.mediaTitle}
  isOpen={commentsOpen}
  onClose={() => (commentsOpen = false)}
/>

{#if threadComment}
  <CommentThreadDrawer
    type={props.type}
    comment={threadComment}
    onClose={() => (threadComment = null)}
  />
{/if}

<style lang="scss">
  .see-all-btn {
    align-self: flex-start;
    height: var(--ni-40);
    padding: 0 var(--gap-l);
    border: none;
    border-radius: var(--trakttime-radius-pill);
    background: var(--color-card-background);
    color: var(--color-text-primary);
    font: inherit;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
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

  .comments-list {
    display: flex;
    flex-direction: column;
  }
</style>
