<script lang="ts">
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import type { ExtendedMediaType } from '$lib/requests/models/ExtendedMediaType.ts';
  import { usePostComment } from '$lib/sections/summary/components/comments/_internal/usePostComment.ts';
  import * as m from '$lib/paraglide/messages.js';

  type Props = {
    type: ExtendedMediaType;
    mediaId: number;
    title: string;
    isOpen: boolean;
    onClose: () => void;
  };

  const { type, mediaId, title, isOpen, onClose }: Props = $props();

  const { postComment, isCommenting, error } = usePostComment();

  let comment = $state('');
  let isSpoiler = $state(false);

  $effect(() => {
    if (!isOpen) {
      comment = '';
      isSpoiler = false;
    }
  });

  async function submit() {
    if (!comment.trim() || $isCommenting) return;

    /*
     * usePostComment only reads media.id (for movie/show) or props.id
     * (for episode); the rest of MediaEntry is unused on the post path.
     * Cast through unknown so callers don't have to fabricate an entire
     * MediaEntry just to attach a comment.
     */
    const stub = { id: mediaId, title } as unknown as never;
    const props =
      type === 'episode'
        ? {
            commentType: 'post' as const,
            type: 'episode' as const,
            id: mediaId,
            season: 0,
            episode: 0,
            media: stub,
          }
        : {
            commentType: 'post' as const,
            type,
            media: stub,
          };

    const result = await postComment({
      ...props,
      comment,
      isSpoiler,
    });

    if (result) {
      onClose();
    }
  }

  function onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="bottom-sheet-backdrop"
    onclick={onBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-label={m.button_label_add_new_comment()}
    tabindex="-1"
  >
    <div class="bottom-sheet sheet">
      <div class="bottom-sheet-handle"></div>
      <p class="sheet-title">{title}</p>

      <textarea
        class="comment-input"
        bind:value={comment}
        placeholder={m.textarea_placeholder_comment()}
        rows="6"
        disabled={$isCommenting}
      ></textarea>

      {#if $error}
        <p class="error-message">{$error}</p>
      {/if}

      <label class="spoiler-row">
        <input
          type="checkbox"
          bind:checked={isSpoiler}
          disabled={$isCommenting}
        />
        <span>{m.switch_label_mark_as_spoiler()}</span>
      </label>

      <div class="actions-row">
        <button
          type="button"
          class="cancel-btn"
          onclick={onClose}
          disabled={$isCommenting}
        >
          {m.button_text_cancel()}
        </button>
        <button
          type="button"
          class="submit-btn"
          onclick={submit}
          disabled={!comment.trim() || $isCommenting}
        >
          {#if $isCommenting}
            <LoadingIndicator />
          {:else}
            {m.button_text_post_comment()}
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .sheet {
    padding-top: var(--gap-s);
    padding-inline: var(--gap-m);
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
  }

  .sheet-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .comment-input {
    box-sizing: border-box;
    width: 100%;
    background: var(--color-background);
    border: var(--ni-1) solid var(--color-border);
    border-radius: var(--border-radius-m);
    color: var(--color-text-primary);
    font-family: inherit;
    font-size: 0.9375rem;
    padding: var(--gap-s);
    resize: vertical;
    min-height: 8rem;

    &:focus {
      outline: none;
      border-color: var(--trakttime-accent);
    }

    &:disabled {
      opacity: 0.6;
    }
  }

  .error-message {
    color: var(--red-500, #ef4444);
    font-size: 0.8125rem;
    margin: 0;
  }

  .spoiler-row {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
    color: var(--color-text-secondary);
    font-size: 0.875rem;

    input {
      accent-color: var(--trakttime-accent);
      width: 1rem;
      height: 1rem;
    }
  }

  .actions-row {
    display: flex;
    gap: var(--gap-s);
  }

  .cancel-btn,
  .submit-btn {
    flex: 1;
    border: none;
    border-radius: var(--border-radius-m);
    font-size: 0.9375rem;
    font-weight: 700;
    padding: var(--gap-m);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }

  .cancel-btn {
    background: none;
    color: var(--color-text-secondary);
    border: var(--ni-1) solid var(--color-border);
  }

  .submit-btn {
    background: var(--trakttime-accent);
    color: var(--color-background);

    :global(.loading-indicator svg) {
      width: var(--ni-20);
      height: var(--ni-20);
    }
  }
</style>
