<div class="trivia-skeleton-row" aria-hidden="true">
  {#each Array(2) as _, i (`ts-${i}`)}
    <div class="trivia-skeleton-card" style:animation-delay="{i * 0.08}s"></div>
  {/each}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .trivia-skeleton-row {
    display: flex;
    gap: var(--gap-s);
    overflow: hidden;
    margin: 0 calc(-1 * var(--gap-m));
    padding: 0 var(--gap-m);
  }

  .trivia-skeleton-card {
    flex-shrink: 0;
    width: min(78vw, var(--ni-280));
    height: var(--trakttime-trivia-card-height);
    border-radius: var(--trakttime-radius-card);
    @include shimmer-bg;
  }
</style>
