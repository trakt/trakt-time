<article class="media-row-skeleton" aria-hidden="true">
  <div class="row-skeleton-poster"></div>
  <div class="row-skeleton-body">
    <div class="row-skeleton-line row-skeleton-line--pill"></div>
    <div class="row-skeleton-line row-skeleton-line--code"></div>
    <div class="row-skeleton-line row-skeleton-line--title"></div>
  </div>
  <div class="row-skeleton-btn"></div>
</article>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  /* Mirrors the EpisodeCard / MovieCard / history row footprint: 60px
     poster, pill + code + title column, and the watched toggle circle. */
  .media-row-skeleton {
    display: flex;
    align-items: center;
    gap: var(--gap-m);
    padding: var(--gap-s) var(--gap-m);
    border-bottom: var(--ni-1) solid var(--color-border);
    background-color: var(--color-card-background);
  }

  .row-skeleton-poster {
    flex-shrink: 0;
    width: var(--trakttime-list-poster-width);
    aspect-ratio: 2 / 3;
    border-radius: var(--border-radius-s);
    @include shimmer-bg-elevated;
  }

  .row-skeleton-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxs);
  }

  .row-skeleton-line {
    border-radius: var(--border-radius-s);
    @include shimmer-bg-elevated;

    /* Heights track the pill, episode code, and title line boxes. */
    &--pill {
      width: var(--ni-112);
      height: var(--ni-18);
      border-radius: var(--border-radius-xxl);
      animation-delay: 0.05s;
    }

    &--code {
      width: var(--ni-64);
      height: 0.875rem;
      animation-delay: 0.1s;
    }

    &--title {
      width: 55%;
      height: 1.0625rem;
      animation-delay: 0.15s;
    }
  }

  .row-skeleton-btn {
    flex-shrink: 0;
    /* The real toggle is a button (border-box), so 36px is its full rect. */
    width: var(--trakttime-watched-btn-size);
    height: var(--trakttime-watched-btn-size);
    border-radius: 50%;
    @include shimmer-bg-elevated;
  }
</style>
