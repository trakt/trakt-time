<script lang="ts">
  import CommentCard from '$lib/components/comment-card/CommentCard.svelte';
  import LoaderIcon from '$lib/components/icons/LoaderIcon.svelte';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import LoadMoreButton from '$lib/components/load-more-button/LoadMoreButton.svelte';
  import RenderFor from '$lib/guards/RenderFor.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { ExtendedMediaType } from '$lib/requests/models/ExtendedMediaType.ts';
  import type { MediaComment } from '$lib/requests/models/MediaComment.ts';
  import { toCommentErrorMessage } from '$lib/sections/summary/components/comments/_internal/toCommentErrorMessage.ts';
  import { useCommentDeleteAction } from '$lib/sections/summary/components/comments/_internal/useCommentDeleteAction.ts';
  import { useCommentReplies } from '$lib/sections/summary/components/comments/_internal/useCommentReplies.ts';
  import { usePostComment } from '$lib/sections/summary/components/comments/_internal/usePostComment.ts';
  import { tick } from 'svelte';

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
  let textareaEl: HTMLTextAreaElement | undefined = $state();

  const wordCount = $derived(
    replyText.trim() === '' ? 0 : replyText.trim().split(/\s+/).length,
  );
  const wordsRemaining = $derived(Math.max(0, MIN_WORDS - wordCount));
  const canSubmit = $derived(wordsRemaining === 0 && !$isCommenting);
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
      isSpoiler: replyIsSpoiler,
    });

    if (result) {
      replyText = '';
      replyIsSpoiler = false;
    }
  }

  function onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  function onTextareaKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
  class="sheet-backdrop"
  onclick={onBackdropClick}
  role="dialog"
  aria-modal="true"
  aria-label={m.header_thread()}
  tabindex="-1"
>
  <div class="sheet">
    <header class="sheet-header">
      <div class="sheet-handle" aria-hidden="true"></div>
      <div class="sheet-title-row">
        <span class="sheet-title">{m.header_thread()}</span>
        <button
          type="button"
          class="close-btn"
          onclick={onClose}
          aria-label={m.button_label_close()}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
          </svg>
        </button>
      </div>
    </header>

    <div class="thread-scroll">
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
        {#if $hasNextPage}
          <LoadMoreButton
            loading={$isLoading}
            onclick={fetchNextPage}
            label={m.button_text_load_more()}
          />
        {/if}
      {:else if $isLoading}
        <div class="thread-loading">
          <LoadingIndicator />
        </div>
      {:else}
        <p class="empty-replies">{m.text_no_replies()}</p>
      {/if}
    </div>

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
        {#if wordsRemaining > 0 && replyText.length > 0}
          <p class="word-hint">
            {m.text_min_words_hint({ count: wordsRemaining })}
          </p>
        {/if}
        <div class="reply-actions">
          <label class="spoiler-label">
            <input
              type="checkbox"
              bind:checked={replyIsSpoiler}
              disabled={$isCommenting}
            />
            <span>{m.switch_label_mark_as_spoiler()}</span>
          </label>
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
  </div>
</div>

<style lang="scss">
  .sheet-backdrop {
    position: fixed;
    inset: 0;
    z-index: var(--layer-overlay);
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    animation: fade-in 0.2s ease;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .sheet {
    width: 100%;
    max-width: var(--trakttime-max-width);
    height: 92dvh;
    box-sizing: border-box;
    padding-bottom: calc(
      var(--trakttime-bottom-nav-height) + env(safe-area-inset-bottom, 0px)
    );
    background: var(--color-card-background);
    border-radius: var(--border-radius-l) var(--border-radius-l) 0 0;
    display: flex;
    flex-direction: column;
    animation: slide-up 0.25s cubic-bezier(0.32, 0.72, 0, 1);
    overflow: hidden;
  }

  @keyframes slide-up {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  .sheet-header {
    flex-shrink: 0;
    padding: var(--gap-s) var(--gap-m) var(--gap-xs);
    border-bottom: var(--ni-1) solid var(--color-border);
  }

  .sheet-handle {
    width: var(--ni-36);
    height: var(--ni-4);
    border-radius: var(--ni-2);
    background: var(--color-border);
    margin: 0 auto var(--gap-xs);
  }

  .sheet-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--gap-s);
  }

  .sheet-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .close-btn {
    background: none;
    border: none;
    padding: var(--ni-6);
    cursor: pointer;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;

    &:hover {
      color: var(--color-text-primary);
      background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
    }

    svg {
      width: var(--ni-20);
      height: var(--ni-20);
    }
  }

  .thread-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 0 var(--gap-m) var(--gap-m);
  }

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
    padding: var(--gap-s) var(--gap-m) var(--gap-m);
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
