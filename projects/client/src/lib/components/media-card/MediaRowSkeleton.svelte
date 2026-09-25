<article class="media-row" aria-hidden="true">
  <div class="media-row-thumb row-skeleton-thumb"></div>
  <div class="media-row-body">
    <div class="row-skeleton-line row-skeleton-line--title"></div>
    <div class="row-skeleton-line row-skeleton-line--code"></div>
    <div class="row-skeleton-line row-skeleton-line--subtitle"></div>
  </div>
  <div class="row-skeleton-btn"></div>
</article>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .row-skeleton-thumb {
    @include shimmer-bg-elevated;
  }

  .row-skeleton-line {
    border-radius: var(--border-radius-s);
    @include shimmer-bg-elevated;

    &--title {
      width: 60%;
      height: 1.1875rem;
      animation-delay: 0.05s;
    }

    &--code {
      width: var(--ni-96);
      height: 1.0625rem;
      animation-delay: 0.1s;
    }

    &--subtitle {
      width: 45%;
      height: 1.0625rem;
      animation-delay: 0.15s;
    }
  }

  .row-skeleton-btn {
    flex-shrink: 0;
    width: var(--trakttime-watched-btn-size);
    height: var(--trakttime-watched-btn-size);
    border-radius: 50%;
    @include shimmer-bg-elevated;
  }
</style>
