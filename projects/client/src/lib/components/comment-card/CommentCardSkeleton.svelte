<div class="comment-skeleton" aria-hidden="true">
  <div class="comment-skeleton-avatar"></div>
  <div class="comment-skeleton-body">
    <div class="comment-skeleton-line comment-skeleton-line--author"></div>
    <div class="comment-skeleton-line comment-skeleton-line--text"></div>
    <div class="comment-skeleton-line comment-skeleton-line--text is-short"></div>
    <div class="comment-skeleton-line comment-skeleton-line--footer"></div>
  </div>
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  /* Mirrors the CommentCard footprint: avatar column + header, clamped
     text, and footer pill rows. */
  .comment-skeleton {
    display: flex;
    gap: var(--gap-m);
    padding: var(--gap-m) 0;
    border-bottom: var(--ni-1) solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }
  }

  .comment-skeleton-avatar {
    flex-shrink: 0;
    width: var(--ni-36);
    height: var(--ni-36);
    border-radius: 50%;
    @include shimmer-bg;
  }

  .comment-skeleton-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
  }

  .comment-skeleton-line {
    border-radius: var(--border-radius-s);
    @include shimmer-bg;

    &--author {
      width: var(--ni-128);
      height: 1rem;
    }

    &--text {
      width: 100%;
      /* Line box of .comment-text: 0.875rem at line-height 1.5. */
      height: 1.3125rem;
      animation-delay: 0.1s;

      &.is-short {
        width: 65%;
        animation-delay: 0.15s;
      }
    }

    &--footer {
      width: var(--ni-64);
      height: var(--ni-18);
      border-radius: var(--border-radius-xxl);
      animation-delay: 0.2s;
    }
  }
</style>
