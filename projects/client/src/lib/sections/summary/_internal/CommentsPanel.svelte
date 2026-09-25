<script lang="ts">
  import CommentCard from '$lib/components/comment-card/CommentCard.svelte';
  import CommentCardSkeleton from '$lib/components/comment-card/CommentCardSkeleton.svelte';
  import AddCommentDrawer from '$lib/components/comment-drawer/AddCommentDrawer.svelte';
  import CommentThreadPanel from '$lib/components/comment-drawer/CommentThreadPanel.svelte';
  import InfiniteScrollTrigger from '$lib/components/infinite-scroll/InfiniteScrollTrigger.svelte';
  import FullScreenPanel from '$lib/components/panel/FullScreenPanel.svelte';
  import RenderFor from '$lib/guards/RenderFor.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { MediaComment } from '$lib/requests/models/MediaComment.ts';
  import { useCommentDeleteAction } from '$lib/sections/summary/components/comments/_internal/useCommentDeleteAction.ts';
  import { type MediaCommentsProps, useMediaComments } from './useMediaComments.ts';

  const SKELETON_COUNT = 4;

  const props: MediaCommentsProps & { onClose: () => void } = $props();

  let composerOpen = $state(false);
  let threadComment = $state<MediaComment | null>(null);

  const commentsResult = $derived(useMediaComments(props));

  const commentList = $derived(commentsResult.list);
  const isLoading = $derived(commentsResult.isLoading);
  const hasNextPage = $derived(commentsResult.hasNextPage);
  const fetchNextPage = $derived(commentsResult.fetchNextPage);

  const { onDelete } = $derived(useCommentDeleteAction({ type: props.type }));
</script>

<FullScreenPanel title={m.list_title_comments()} onClose={props.onClose}>
  {#if $isLoading && $commentList.length === 0}
    <div class="comments-list" aria-hidden="true">
      {#each Array(SKELETON_COUNT) as _, i (`cs-${i}`)}
        <CommentCardSkeleton />
      {/each}
    </div>
  {:else if $commentList.length > 0}
    <div class="comments-list">
      {#each $commentList as comment (comment.key)}
        <CommentCard
          {comment}
          onOpenThread={(c) => (threadComment = c)}
          {onDelete}
        />
      {/each}
    </div>
    <InfiniteScrollTrigger
      hasMore={$hasNextPage}
      isLoading={$isLoading}
      count={$commentList.length}
      onload={fetchNextPage}
    />
  {:else}
    <p class="comments-empty">{m.text_no_reviews()}</p>
  {/if}

  {#snippet footer()}
    <RenderFor audience="authenticated">
      <button
        type="button"
        class="add-review-fab"
        aria-label={m.button_label_add_new_comment()}
        onclick={() => (composerOpen = true)}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </button>
    </RenderFor>
  {/snippet}
</FullScreenPanel>

<AddCommentDrawer
  type={props.type}
  mediaId={props.mediaId}
  title={props.mediaTitle}
  isOpen={composerOpen}
  onClose={() => (composerOpen = false)}
/>

{#if threadComment}
  <CommentThreadPanel
    type={props.type}
    comment={threadComment}
    onClose={() => (threadComment = null)}
  />
{/if}

<style lang="scss">
  .comments-list {
    display: flex;
    flex-direction: column;
    padding-bottom: var(--ni-80);
  }

  .comments-empty {
    margin: var(--gap-xl) 0 0;
    text-align: center;
    color: var(--color-text-secondary);
  }

  .add-review-fab {
    position: absolute;
    right: var(--gap-m);
    bottom: calc(var(--gap-l) + env(safe-area-inset-bottom, 0px));
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--ni-56);
    height: var(--ni-56);
    padding: 0;
    border: none;
    border-radius: 50%;
    background: var(--trakttime-gradient);
    color: var(--trakttime-accent-foreground);
    box-shadow: 0 var(--ni-8) var(--ni-24) color-mix(in srgb, var(--purple-500) 35%, transparent);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    svg {
      width: var(--ni-28);
      height: var(--ni-28);
    }
  }
</style>
