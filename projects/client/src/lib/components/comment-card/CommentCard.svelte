<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import { Marked } from 'marked';
  import { useUser } from '$lib/features/auth/stores/useUser.ts';
  import ChatBubbleIcon from '$lib/components/icons/ChatBubbleIcon.svelte';
  import HeartIcon from '$lib/components/icons/HeartIcon.svelte';
  import { spoilerExtension } from '$lib/sections/summary/components/comments/_internal/marked/spoilerExtension.ts';
  import type { MediaComment } from '$lib/requests/models/MediaComment.ts';
  import StarIcon from '$lib/components/icons/StarIcon.svelte';
  import { languageTag } from '$lib/features/i18n/index.ts';
  import { toCompactAge } from '$lib/utils/date/toCompactAge.ts';
  import CommentGif from './_internal/CommentGif.svelte';

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
  let avatarFailed = $state(false);
  let expanded = $state(false);
  let commentEl: HTMLElement | undefined = $state(undefined);
  let isOverflowing = $state(false);

  const marked = new Marked({ extensions: [spoilerExtension()] });

  const displayName = $derived(comment.user.name.full || comment.user.username);

  const age = $derived(
    toCompactAge({ date: comment.createdAt, now: new Date(), locale: languageTag() }),
  );
  const userRating = $derived(comment.user.stats.rating);
  const hasText = $derived(comment.comment.trim().length > 0);

  const html = $derived(
    marked.parse(comment.comment, { gfm: true, breaks: true }) as string,
  );

  $effect(() => {
    if (commentEl && !expanded) {
      isOverflowing = commentEl.scrollHeight > commentEl.clientHeight;
    }
  });
</script>

<article class="comment-card">
  <header class="comment-header">
    <div class="comment-avatar">
      {#if comment.user.avatar.url && !avatarFailed}
        <img
          src={comment.user.avatar.url}
          alt=""
          loading="lazy"
          onerror={() => (avatarFailed = true)}
        />
      {:else}
        <div class="avatar-placeholder">{displayName.charAt(0).toUpperCase()}</div>
      {/if}
    </div>
    <span class="comment-author">{displayName}</span>
    {#if userRating}
      <span class="comment-rating" aria-label="{userRating}/10">
        <StarIcon fill="full" />
        {userRating}
      </span>
    {/if}
    <span class="comment-time">· {age}</span>
    {#if comment.isReview}
      <span class="review-badge">{m.tag_text_review()}</span>
    {/if}
  </header>

  {#if hasText}
    {#if comment.isSpoiler && !spoilerRevealed}
      <button class="spoiler-btn" onclick={() => (spoilerRevealed = true)}>
        <span class="spoiler-blur" aria-hidden="true">{comment.comment.slice(0, 140)}</span>
        <span class="spoiler-label">{m.text_reveal_spoiler()}</span>
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
  {/if}

  {#if comment.gif}
    <CommentGif
      gif={comment.gif}
      isHidden={comment.isSpoiler && !spoilerRevealed}
      hasRevealLabel={!hasText}
      onReveal={() => (spoilerRevealed = true)}
    />
  {/if}

  <footer class="comment-footer">
    <span class="comment-action">
      <HeartIcon />
      {comment.likeCount}
    </span>
    {#if onOpenThread}
      <button
        type="button"
        class="comment-action comment-action--button"
        onclick={() => onOpenThread?.(comment)}
        aria-label={m.button_label_open_thread({ name: displayName })}
      >
        <ChatBubbleIcon />
        {comment.replyCount > 0 ? comment.replyCount : m.button_text_post_reply()}
      </button>
    {:else}
      <span class="comment-action">
        <ChatBubbleIcon />
        {comment.replyCount}
      </span>
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
  </footer>
</article>

<style lang="scss">
  .comment-card {
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);
    padding: var(--gap-m) 0;
    border-bottom: var(--ni-1) solid var(--color-border);
  }

  .comment-header {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
    min-width: 0;
  }

  .comment-avatar {
    flex-shrink: 0;
    width: var(--ni-32);
    height: var(--ni-32);
    border-radius: 50%;
    overflow: hidden;
    background: var(--color-card-background);

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
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  .comment-author {
    min-width: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .comment-rating {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: var(--ni-2);
    padding: 0 var(--gap-xs);
    border-radius: var(--trakttime-radius-pill);
    background: color-mix(in srgb, var(--trakttime-accent) 16%, transparent);
    color: var(--trakttime-accent);
    font-size: 0.75rem;
    font-weight: 700;
    line-height: 1.25rem;

    :global(svg) {
      width: var(--ni-12);
      height: var(--ni-12);
    }
  }

  .comment-time {
    flex-shrink: 0;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .review-badge {
    flex-shrink: 0;
    margin-inline-start: auto;
    padding: 0 var(--gap-xs);
    border: var(--ni-1) solid var(--color-border);
    border-radius: var(--trakttime-radius-pill);
    font-size: 0.6875rem;
    font-weight: 600;
    line-height: 1.25rem;
    color: var(--color-text-secondary);
  }

  .comment-text {
    font-size: 1rem;
    line-height: 1.5;
    color: var(--color-text-primary);
    word-break: break-word;

    &.clamped {
      display: -webkit-box;
      -webkit-line-clamp: 4;
      line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    :global(p) {
      margin: 0;

      & + :global(p) {
        margin-top: 0.4em;
      }
    }

    :global(img) {
      display: block;
      width: 100%;
      max-height: var(--ni-320);
      margin-top: var(--gap-s);
      object-fit: cover;
      border-radius: var(--trakttime-radius-card);
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
    align-self: flex-start;
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--trakttime-accent);
    cursor: pointer;
  }

  .spoiler-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: var(--ni-72);
    padding: var(--gap-m);
    overflow: hidden;
    border: none;
    border-radius: var(--trakttime-radius-card);
    background: var(--color-card-background);
    font: inherit;
    cursor: pointer;
  }

  .spoiler-blur {
    position: absolute;
    inset: var(--gap-m);
    font-size: 1rem;
    line-height: 1.5;
    text-align: start;
    color: var(--color-text-primary);
    filter: blur(7px);
    opacity: 0.6;
    overflow: hidden;
  }

  .spoiler-label {
    position: relative;
    padding: var(--gap-xxs) var(--gap-s);
    border-radius: var(--trakttime-radius-pill);
    background: var(--color-floating-background);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .comment-footer {
    display: flex;
    align-items: center;
    gap: var(--gap-l);
  }

  .comment-action {
    display: inline-flex;
    align-items: center;
    gap: var(--gap-xxs);
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    font-size: 0.875rem;
    color: var(--color-text-secondary);

    :global(svg) {
      width: var(--ni-18);
      height: var(--ni-18);
    }
  }

  .comment-action--button {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    &:hover,
    &:focus-visible {
      color: var(--trakttime-accent);
    }
  }

  .delete-btn {
    margin-inline-start: auto;
    display: inline-flex;
    align-items: center;
    gap: var(--gap-xxs);
    padding: var(--ni-2) var(--gap-s);
    border: var(--ni-1) solid var(--color-border);
    border-radius: var(--trakttime-radius-pill);
    background: none;
    color: var(--color-text-secondary);
    font: inherit;
    font-size: 0.75rem;
    cursor: pointer;

    svg {
      width: var(--ni-12);
      height: var(--ni-12);
    }

    &:hover,
    &:active {
      color: var(--red-500);
      border-color: color-mix(in srgb, var(--red-500) 60%, transparent);
    }
  }
</style>
