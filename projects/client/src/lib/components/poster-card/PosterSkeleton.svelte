<div class="poster-skeleton" aria-hidden="true">
  <div class="poster-skeleton-img"></div>
  <div class="poster-skeleton-text"></div>
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .poster-skeleton {
    flex-shrink: 0;
    width: var(--trakttime-poster-card-width);
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxs);
  }

  .poster-skeleton-img {
    width: 100%;
    aspect-ratio: 2 / 3;
    border-radius: var(--border-radius-m);
    @include shimmer-bg;
  }

  .poster-skeleton-text {
    height: 1rem;
    border-radius: var(--border-radius-s);
    @include shimmer-bg;
    animation-delay: 0.1s;
  }
</style>
