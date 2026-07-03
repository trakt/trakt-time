<div class="sentiment-summary-card-skeleton" aria-hidden="true">
  <div class="sentiment-skeleton-body">
    <div class="sentiment-skeleton-line sentiment-skeleton-line--verdict"></div>
    <div class="sentiment-skeleton-line" style:width="var(--ni-224)"></div>
    <div class="sentiment-skeleton-line" style:width="var(--ni-192)"></div>
    <div class="sentiment-skeleton-line" style:width="var(--ni-160)"></div>
  </div>
  <div class="sentiment-skeleton-chevron"></div>
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  /* Mirrors SentimentSummaryCard: verdict line + bulleted aspect lines + chevron. */
  .sentiment-summary-card-skeleton {
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--gap-s);

    padding: var(--gap-m);
    box-sizing: border-box;

    border-radius: var(--border-radius-m);
    background: var(--background-vip-drawer);
  }

  .sentiment-skeleton-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    min-width: 0;
  }

  .sentiment-skeleton-line {
    height: 1rem;
    width: var(--ni-128);
    border-radius: var(--border-radius-s);
    @include shimmer-bg-elevated;

    &--verdict {
      width: var(--ni-96);
      height: 1.125rem;
    }
  }

  .sentiment-skeleton-chevron {
    flex-shrink: 0;
    width: var(--trakttime-icon-md);
    height: var(--trakttime-icon-md);
    border-radius: 50%;
    @include shimmer-bg-elevated;
  }
</style>
