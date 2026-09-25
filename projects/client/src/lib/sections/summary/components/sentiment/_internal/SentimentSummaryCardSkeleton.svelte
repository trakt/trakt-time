<div class="sentiment-card-skeleton" aria-hidden="true"></div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .sentiment-card-skeleton {
    height: var(--trakttime-sentiment-card-height);
    border-radius: var(--trakttime-radius-card);
    @include shimmer-bg;
  }
</style>
