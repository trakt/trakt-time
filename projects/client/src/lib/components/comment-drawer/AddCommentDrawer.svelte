<script lang="ts">
  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import GifButton from '$lib/features/gif-picker/GifButton.svelte';
  import { klipyCustomerId } from '$lib/features/gif-picker/klipyCustomerId.ts';
  import { reportGifShare } from '$lib/features/gif-picker/reportGifShare.ts';
  import { toGifSuggestedQuery } from '$lib/features/gif-picker/toGifSuggestedQuery.ts';
  import type { ExtendedMediaType } from '$lib/requests/models/ExtendedMediaType.ts';
  import { usePostComment } from '$lib/sections/summary/components/comments/_internal/usePostComment.ts';
  import * as m from '$lib/paraglide/messages.js';
  import type { CommentDraftGif } from './_internal/CommentDraftGif.ts';
  import SelectedGif from './_internal/SelectedGif.svelte';
  import { toCommentDraftGif } from './_internal/toCommentDraftGif.ts';
  import { toCommentGifParams } from './_internal/toCommentGifParams.ts';

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
  let gif = $state<CommentDraftGif | null>(null);
  let inputEl: HTMLTextAreaElement | undefined = $state();

  const canPost = $derived((comment.trim().length > 0 || gif != null) && !$isCommenting);

  $effect(() => {
    if (!isOpen) {
      comment = '';
      isSpoiler = false;
      gif = null;
    }
  });

  $effect(() => {
    if (isOpen) inputEl?.focus();
  });

  async function submit() {
    if (!canPost) return;

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
      gif: toCommentGifParams(gif),
      isSpoiler,
    });

    if (!result) return;

    reportGifShare({ slug: gif?.slug, customerId: klipyCustomerId() });
    onClose();
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') onClose();
  }
</script>

{#if isOpen}
  <div
    class="composer"
    role="dialog"
    aria-modal="true"
    aria-label={m.button_label_add_new_comment()}
    tabindex="-1"
    onkeydown={onKeydown}
  >
    <header class="composer-header">
      <button
        type="button"
        class="composer-close"
        aria-label={m.button_text_cancel()}
        onclick={onClose}
        disabled={$isCommenting}
      >
        <CloseIcon />
      </button>
      <p class="composer-title">{title}</p>
      <button
        type="button"
        class="composer-post"
        onclick={submit}
        disabled={!canPost}
      >
        {#if $isCommenting}
          <LoadingIndicator />
        {:else}
          {m.button_text_post_comment()}
        {/if}
      </button>
    </header>

    <textarea
      bind:this={inputEl}
      bind:value={comment}
      class="composer-input"
      placeholder={m.textarea_placeholder_comment()}
      disabled={$isCommenting}
    ></textarea>

    {#if $error}
      <p class="composer-error">{$error}</p>
    {/if}

    <footer class="composer-footer">
      {#if gif}
        <SelectedGif {gif} disabled={$isCommenting} onRemove={() => (gif = null)} />
      {/if}

      <div class="composer-toolbar">
        <GifButton
          disabled={$isCommenting}
          suggestedQuery={toGifSuggestedQuery({ title, type })}
          onSelect={(selected) => (gif = toCommentDraftGif(selected))}
        />
        <button
          type="button"
          class="composer-spoiler"
          aria-pressed={isSpoiler}
          disabled={$isCommenting}
          onclick={() => (isSpoiler = !isSpoiler)}
        >
          {m.switch_label_mark_as_spoiler()}
        </button>
      </div>
    </footer>
  </div>
{/if}

<style lang="scss">
  .composer {
    position: fixed;
    inset: 0;
    z-index: var(--layer-menu);
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
    max-width: var(--trakttime-max-width);
    margin: 0 auto;
    padding: calc(var(--gap-s) + env(safe-area-inset-top, 0px)) var(--gap-m)
      calc(var(--gap-s) + env(safe-area-inset-bottom, 0px));
    box-sizing: border-box;
    background: var(--color-background);
    animation: composer-in 0.25s cubic-bezier(0.32, 0.72, 0, 1);
  }

  .composer-header {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
  }

  .composer-close {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--ni-44);
    height: var(--ni-44);
    padding: 0;
    border: none;
    border-radius: 50%;
    background: var(--color-card-background);
    color: var(--color-text-primary);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    :global(svg) {
      width: var(--ni-18);
      height: var(--ni-18);
    }
  }

  .composer-title {
    flex: 1;
    min-width: 0;
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .composer-post {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: var(--ni-80);
    height: var(--ni-44);
    padding: 0 var(--gap-m);
    border: none;
    border-radius: var(--trakttime-radius-pill);
    background: var(--trakttime-gradient);
    color: var(--trakttime-accent-foreground);
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: opacity var(--transition-increment) ease-in-out;

    &:disabled {
      background: var(--color-card-background);
      color: var(--color-text-secondary);
      cursor: default;
    }

    :global(.loading-indicator svg) {
      width: var(--ni-20);
      height: var(--ni-20);
    }
  }

  .composer-input {
    flex: 1;
    min-height: 0;
    width: 100%;
    padding: var(--gap-xs) var(--gap-xxs);
    box-sizing: border-box;
    border: none;
    background: none;
    color: var(--color-text-primary);
    font: inherit;
    font-size: 1.0625rem;
    line-height: 1.5;
    resize: none;
    caret-color: var(--trakttime-accent);

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: var(--color-text-secondary);
    }

    &:disabled {
      opacity: 0.6;
    }
  }

  .composer-error {
    margin: 0;
    color: var(--color-input-error);
    font-size: 0.8125rem;
  }

  .composer-footer {
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);
  }

  .composer-toolbar {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
  }

  .composer-spoiler {
    margin-left: auto;
    height: var(--ni-32);
    padding: 0 var(--gap-s);
    border: var(--ni-1) solid var(--color-border);
    border-radius: var(--trakttime-radius-pill);
    background: none;
    color: var(--color-text-secondary);
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    &[aria-pressed='true'] {
      border-color: transparent;
      background: color-mix(in srgb, var(--trakttime-accent) 16%, transparent);
      color: var(--trakttime-accent);
    }
  }

  @keyframes composer-in {
    from {
      transform: translateY(var(--gap-xl));
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .composer {
      animation: none;
    }
  }
</style>
