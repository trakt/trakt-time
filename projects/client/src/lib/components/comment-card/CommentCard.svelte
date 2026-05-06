<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import { Marked } from 'marked';
  import { useUser } from '$lib/features/auth/stores/useUser.ts';
  import ChatBubbleIcon from '$lib/components/icons/ChatBubbleIcon.svelte';
  import HeartIcon from '$lib/components/icons/HeartIcon.svelte';
  import { spoilerExtension } from '$lib/sections/summary/components/comments/_internal/marked/spoilerExtension.ts';
  import type { MediaComment } from '$lib/requests/models/MediaComment.ts';

  type Props = {
    comment: MediaComment;
    onOpenThread?: (comment: MediaComment) => void;
    onDelete?: (comment: MediaComment) => void;
  };

  const { comment, onOpenThread, onDelete }: Props = $props();

  const { user } = useUser();
  const isOwn = $derived(
    !!$user.username && $user.username === comment.user.username,
  );

  let spoilerRevealed = $state(false);
  let expanded = $state(false);
  let commentEl: HTMLElement | undefined = $state(undefined);
  let isOverflowing = $state(false);

  const marked = new Marked({ extensions: [spoilerExtension()] });

  const displayName = $derived(comment.user.name.full || comment.user.username);

  const relativeTime = $derived(
    new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(
      Math.round((comment.createdAt.getTime() - Date.now()) / 1000 / 60 / 60 / 24),
      'day',
    ),
  );

  const html = $derived(
    marked.parse(comment.comment, { gfm: true, breaks: true }) as string,
  );

  $effect(() => {
    if (commentEl && !expanded) {
      isOverflowing = commentEl.scrollHeight > commentEl.clientHeight;
    }
  });
</script>

<div class="comment-card">
  <div class="comment-avatar">
    {#if comment.user.avatar.url}
      <img src={comment.user.avatar.url} alt={displayName} loading="lazy" />
    {:else}
      <div class="avatar-placeholder">{displayName.charAt(0).toUpperCase()}</div>
    {/if}
  </div>

  <div class="comment-body">
    <div class="comment-header">
      <span class="comment-author">{displayName}</span>
      <span class="comment-time">{relativeTime}</span>
    </div>

    {#if comment.isSpoiler && !spoilerRevealed}
      <button class="spoiler-btn" onclick={() => (spoilerRevealed = true)}>
        Tap to reveal spoiler
      </button>
    {:else}
      <div
        class="comment-text"
        class:clamped={!expanded}
        bind:this={commentEl}
      >
        {@html html}
      </div>
      {#if !expanded && isOverflowing}
        <button class="expand-btn" onclick={() => (expanded = true)}>more</button>
      {/if}
    {/if}

    <div class="comment-footer">
      {#if comment.likeCount > 0}
        <span class="like-count">
          <HeartIcon />
          {comment.likeCount}
        </span>
      {/if}
      {#if onOpenThread}
        <button
          type="button"
          class="thread-btn"
          onclick={() => onOpenThread?.(comment)}
          aria-label={m.button_label_open_thread({ name: displayName })}
        >
          <ChatBubbleIcon />
          <span>
            {comment.replyCount > 0
              ? comment.replyCount
              : m.button_text_post_reply()}
          </span>
        </button>
      {:else if comment.replyCount > 0}
        <span class="reply-count">
          <ChatBubbleIcon />
          {comment.replyCount}
        </span>
      {/if}
      {#if comment.isReview}
        <span class="review-badge">{m.tag_text_review()}</span>
      {/if}
      {#if isOwn && onDelete}
        <button
          type="button"
          class="delete-btn"
          onclick={() => onDelete?.(comment)}
          aria-label={m.button_text_delete_comment()}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
          <span>{m.button_text_delete()}</span>
        </button>
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .comment-card {
    display: flex;
    gap: var(--gap-m);
    padding: var(--gap-m) 0;
    border-bottom: var(--ni-1) solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }
  }

  .comment-avatar {
    flex-shrink: 0;
    width: var(--ni-36);
    height: var(--ni-36);
    border-radius: 50%;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    background: var(--trakttime-accent);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 700;
  }

  .comment-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
  }

  .comment-header {
    display: flex;
    align-items: baseline;
    gap: var(--gap-s);
  }

  .comment-author {
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .comment-time {
    font-size: 0.6875rem;
    color: var(--color-text-secondary);
  }

  .comment-text {
    font-size: 0.875rem;
    color: var(--color-text-primary);
    line-height: 1.5;
    word-break: break-word;

    &.clamped {
      display: -webkit-box;
      -webkit-line-clamp: 3;
    line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    :global(p) {
      margin: 0;

      & + :global(p) {
        margin-top: 0.25em;
      }
    }

    :global(a) {
      color: var(--trakttime-accent);
      text-decoration: underline;
    }

    :global(strong) {
      font-weight: 700;
    }

    :global(em) {
      font-style: italic;
    }
  }

  .expand-btn {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--trakttime-accent);
    cursor: pointer;
    align-self: flex-start;
  }

  .spoiler-btn {
    background: color-mix(in srgb, var(--color-text-secondary) 15%, transparent);
    border: var(--ni-1) dashed var(--color-border);
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    padding: var(--gap-s) var(--gap-m);
    border-radius: var(--border-radius-s);
    cursor: pointer;
    width: 100%;
    text-align: center;
  }

  .comment-footer {
    display: flex;
    align-items: center;
    gap: var(--gap-m);
  }

  .like-count,
  .reply-count {
    display: flex;
    align-items: center;
    gap: var(--gap-xxs);
    font-size: 0.75rem;
    color: var(--color-text-secondary);

    :global(svg) {
      width: var(--ni-12);
      height: var(--ni-12);
    }
  }

  .delete-btn {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: var(--gap-xxs);
    padding: var(--ni-2) var(--ni-6);
    background: none;
    border: var(--ni-1) solid var(--color-border);
    border-radius: 999px;
    color: var(--color-text-secondary);
    font-size: 0.75rem;
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;

    svg {
      width: var(--ni-12);
      height: var(--ni-12);
    }

    &:hover,
    &:active {
      color: var(--red-500, #ef4444);
      border-color: color-mix(in srgb, var(--red-500, #ef4444) 60%, transparent);
      background: color-mix(in srgb, var(--red-500, #ef4444) 10%, transparent);
    }
  }

  .thread-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--gap-xxs);
    padding: var(--ni-2) var(--ni-6);
    background: none;
    border: var(--ni-1) solid var(--color-border);
    border-radius: 999px;
    color: var(--color-text-secondary);
    font-size: 0.75rem;
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;

    :global(svg) {
      width: var(--ni-12);
      height: var(--ni-12);
    }

    &:hover {
      color: var(--trakttime-accent);
      border-color: var(--trakttime-accent);
      background: color-mix(in srgb, var(--trakttime-accent) 10%, transparent);
    }
  }

  .review-badge {
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: var(--ni-2) var(--gap-xs);
    border-radius: var(--border-radius-xs);
    background: color-mix(in srgb, var(--trakttime-accent) 15%, transparent);
    color: var(--trakttime-accent);
    text-transform: uppercase;
  }
</style>
