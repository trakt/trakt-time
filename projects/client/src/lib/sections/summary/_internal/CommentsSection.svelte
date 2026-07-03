<script lang="ts">
  import CommentCard from '$lib/components/comment-card/CommentCard.svelte';
  import CommentCardSkeleton from '$lib/components/comment-card/CommentCardSkeleton.svelte';
  import AddCommentDrawer from '$lib/components/comment-drawer/AddCommentDrawer.svelte';
  import CommentThreadDrawer from '$lib/components/comment-drawer/CommentThreadDrawer.svelte';
  import LoadMoreButton from '$lib/components/load-more-button/LoadMoreButton.svelte';
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
</script>

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
    <div class="comments-list" aria-hidden="true">
      {#each Array(3) as _, i (`cs-${i}`)}
        <CommentCardSkeleton />
      {/each}
    </div>
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

  .section-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
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
