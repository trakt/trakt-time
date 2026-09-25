<script lang="ts">
  import CommentCard from '$lib/components/comment-card/CommentCard.svelte';
  import LoaderIcon from '$lib/components/icons/LoaderIcon.svelte';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import InfiniteScrollTrigger from '$lib/components/infinite-scroll/InfiniteScrollTrigger.svelte';
  import GifButton from '$lib/features/gif-picker/GifButton.svelte';
  import { klipyCustomerId } from '$lib/features/gif-picker/klipyCustomerId.ts';
  import { reportGifShare } from '$lib/features/gif-picker/reportGifShare.ts';
  import FullScreenPanel from '$lib/components/panel/FullScreenPanel.svelte';
  import RenderFor from '$lib/guards/RenderFor.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { ExtendedMediaType } from '$lib/requests/models/ExtendedMediaType.ts';
  import type { MediaComment } from '$lib/requests/models/MediaComment.ts';
  import { toCommentErrorMessage } from '$lib/sections/summary/components/comments/_internal/toCommentErrorMessage.ts';
  import { useCommentDeleteAction } from '$lib/sections/summary/components/comments/_internal/useCommentDeleteAction.ts';
  import { useCommentReplies } from '$lib/sections/summary/components/comments/_internal/useCommentReplies.ts';
  import { usePostComment } from '$lib/sections/summary/components/comments/_internal/usePostComment.ts';
  import { tick } from 'svelte';
  import type { CommentDraftGif } from './_internal/CommentDraftGif.ts';
  import SelectedGif from './_internal/SelectedGif.svelte';
  import { toCommentDraftGif } from './_internal/toCommentDraftGif.ts';
  import { toCommentGifParams } from './_internal/toCommentGifParams.ts';

  const MIN_WORDS = 5;

  type Props = {
    type: ExtendedMediaType;
    comment: MediaComment;
    onClose: () => void;
  };

  const { type, comment, onClose }: Props = $props();

  const repliesResult = $derived(
    useCommentReplies({ id: comment.id, limit: 20 }),
  );
  const list = $derived(repliesResult.list);
  const isLoading = $derived(repliesResult.isLoading);
  const hasNextPage = $derived(repliesResult.hasNextPage);
  const fetchNextPage = $derived(repliesResult.fetchNextPage);

  const { postComment, isCommenting, error } = usePostComment();

  const deleteAction = $derived(
    useCommentDeleteAction({
      type,
      onDeleted: (deleted) => {
        if (deleted.id === comment.id) onClose();
      },
    }),
  );
  const onDelete = $derived(deleteAction.onDelete);

  let replyText = $state('');
  let replyIsSpoiler = $state(false);
  let replyGif = $state<CommentDraftGif | null>(null);
  let textareaEl: HTMLTextAreaElement | undefined = $state();

  const wordCount = $derived(
    replyText.trim() === '' ? 0 : replyText.trim().split(/\s+/).length,
  );
  const wordsRemaining = $derived(Math.max(0, MIN_WORDS - wordCount));
  const canSubmit = $derived(
    (wordsRemaining === 0 || replyGif != null) && !$isCommenting,
  );
  const errorMessage = $derived(toCommentErrorMessage($error));

  $effect(() => {
    // Defer focus to next tick so the slide-up animation has begun;
    // focusing on hidden elements jumps the parent scroll.
    tick().then(() => textareaEl?.focus());
  });

  async function submit() {
    if (!canSubmit) return;

    const result = await postComment({
      commentType: 'reply',
      id: comment.id,
      type,
      comment: replyText,
      gif: toCommentGifParams(replyGif),
      isSpoiler: replyIsSpoiler,
    });

    if (!result) return;

    reportGifShare({ slug: replyGif?.slug, customerId: klipyCustomerId() });
    replyText = '';
    replyIsSpoiler = false;
    replyGif = null;
  }

  function onTextareaKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  }
</script>

<FullScreenPanel title={m.header_thread()} {onClose}>
  <div class="parent-wrap">
    <CommentCard {comment} {onDelete} />
  </div>

  {#if $list.length > 0}
    <div class="replies-divider">
      <span>{m.header_replies()}</span>
      <span class="reply-count">{comment.replyCount}</span>
    </div>
    <ul class="replies-list">
      {#each $list as reply (reply.key)}
        <li class="reply-item">
          <CommentCard comment={reply} {onDelete} />
        </li>
      {/each}
    </ul>
    <InfiniteScrollTrigger
      hasMore={$hasNextPage}
      isLoading={$isLoading}
      count={$list.length}
      onload={fetchNextPage}
    />
  {:else if $isLoading}
    <div class="thread-loading">
      <LoadingIndicator />
    </div>
  {:else}
    <p class="empty-replies">{m.text_no_replies()}</p>
  {/if}

  {#snippet footer()}
    <RenderFor audience="authenticated">
      <form
        class="reply-composer"
        onsubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {#if errorMessage}
          <p class="error-message">{errorMessage}</p>
        {/if}
        <textarea
          bind:this={textareaEl}
          bind:value={replyText}
          onkeydown={onTextareaKey}
          class="reply-input"
          placeholder={m.textarea_placeholder_reply()}
          rows="2"
          disabled={$isCommenting}
        ></textarea>
        {#if replyGif}
          <SelectedGif
            gif={replyGif}
            disabled={$isCommenting}
            onRemove={() => (replyGif = null)}
          />
        {/if}
        {#if wordsRemaining > 0 && replyText.length > 0 && !replyGif}
          <p class="word-hint">
            {m.text_min_words_hint({ count: wordsRemaining })}
          </p>
        {/if}
        <div class="reply-actions">
          <div class="reply-tools">
            <GifButton
              disabled={$isCommenting}
              onSelect={(selected) => (replyGif = toCommentDraftGif(selected))}
            />
          <label class="spoiler-label">
            <input
              type="checkbox"
              bind:checked={replyIsSpoiler}
              disabled={$isCommenting}
            />
            <span>{m.switch_label_mark_as_spoiler()}</span>
          </label>
          </div>
          <button type="submit" class="submit-btn" disabled={!canSubmit}>
            {#if $isCommenting}
              <span class="submit-spinner"><LoaderIcon /></span>
            {:else}
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
              </svg>
              <span>{m.button_text_post_reply()}</span>
            {/if}
          </button>
        </div>
      </form>
    </RenderFor>
  {/snippet}
</FullScreenPanel>

<style lang="scss">
  .parent-wrap {
    border-bottom: var(--ni-1) solid var(--color-border);
  }

  .replies-divider {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
    padding: var(--gap-m) 0 var(--gap-s);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .reply-count {
    color: var(--trakttime-accent);
  }

  .replies-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  .reply-item {
    padding-left: var(--gap-m);
    border-left: var(--ni-2) solid var(--color-border);
    margin-left: var(--ni-12);
  }

  .empty-replies {
    margin: 0;
    padding: var(--gap-l) var(--gap-m);
    text-align: center;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }

  .thread-loading {
    display: flex;
    justify-content: center;
    padding: var(--gap-l) 0;
  }

  .reply-composer {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    padding: var(--gap-s) var(--gap-m)
      calc(var(--gap-m) + env(safe-area-inset-bottom, 0px));
    border-top: var(--ni-1) solid var(--color-border);
    background: var(--color-card-background);
  }

  .error-message {
    color: var(--red-500, #ef4444);
    font-size: 0.8125rem;
    margin: 0;
  }

  .word-hint {
    color: var(--color-text-secondary);
    font-size: 0.75rem;
    margin: 0;
  }

  .reply-input {
    box-sizing: border-box;
    width: 100%;
    background: var(--color-background);
    border: var(--ni-1) solid var(--color-border);
    border-radius: var(--border-radius-m);
    color: var(--color-text-primary);
    font-family: inherit;
    font-size: 0.9375rem;
    padding: var(--gap-s);
    resize: none;
    min-height: var(--ni-48);

    &:focus {
      outline: none;
      border-color: var(--trakttime-accent);
    }

    &:disabled {
      opacity: 0.6;
    }
  }

  .reply-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--gap-s);
  }

  .reply-tools {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
  }

  .spoiler-label {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    cursor: pointer;

    input {
      accent-color: var(--trakttime-accent);
      width: 0.875rem;
      height: 0.875rem;
    }
  }

  .submit-btn {
    background: var(--trakttime-accent);
    color: var(--color-background);
    border: none;
    border-radius: 999px;
    font-size: 0.9375rem;
    font-weight: 700;
    padding: var(--ni-10) var(--gap-l);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--gap-xs);
    min-width: var(--ni-104);
    transition: transform 0.1s ease, opacity 0.15s ease;

    svg {
      width: var(--ni-16);
      height: var(--ni-16);
    }

    &:not(:disabled):active {
      transform: scale(0.97);
    }

    &:disabled {
      opacity: 0.45;
      cursor: default;
    }
  }

  .submit-spinner {
    display: inline-flex;
    animation: spin 0.9s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(1turn);
    }
  }
</style>
