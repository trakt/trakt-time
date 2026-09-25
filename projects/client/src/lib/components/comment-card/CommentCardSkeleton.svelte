<div class="comment-skeleton" aria-hidden="true">
  <div class="comment-skeleton-header">
    <div class="comment-skeleton-avatar"></div>
    <div class="comment-skeleton-line comment-skeleton-line--author"></div>
  </div>
  <div class="comment-skeleton-line comment-skeleton-line--text"></div>
  <div class="comment-skeleton-line comment-skeleton-line--text is-short"></div>
  <div class="comment-skeleton-line comment-skeleton-line--footer"></div>
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .comment-skeleton {
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);
    padding: var(--gap-m) 0;
    border-bottom: var(--ni-1) solid var(--color-border);
  }

  .comment-skeleton-header {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
  }

  .comment-skeleton-avatar {
    width: var(--ni-32);
    height: var(--ni-32);
    border-radius: 50%;
    @include shimmer-bg;
  }

  .comment-skeleton-line {
    border-radius: var(--border-radius-s);
    @include shimmer-bg;

    &--author {
      width: var(--ni-120);
      height: 1.125rem;
    }

    &--text {
      width: 100%;
      height: 1.5rem;

      &.is-short {
        width: 70%;
      }
    }

    &--footer {
      width: var(--ni-96);
      height: 1.25rem;
    }
  }
</style>
