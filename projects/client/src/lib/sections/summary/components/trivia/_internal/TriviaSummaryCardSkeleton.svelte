<script lang="ts">
  const WIDTHS = ['var(--ni-224)', 'var(--ni-192)', 'var(--ni-160)'];
</script>

<div class="trivia-summary-card-skeleton" aria-hidden="true">
  <ul class="trivia-skeleton-list">
    {#each WIDTHS as width, i (i)}
      <li>
        <div class="trivia-skeleton-icon"></div>
        <div class="trivia-skeleton-line" style:width></div>
      </li>
    {/each}
  </ul>
  <div class="trivia-skeleton-chevron"></div>
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  /* Mirrors TriviaSection's card: sparkle icon + fact line per row + chevron. */
  .trivia-summary-card-skeleton {
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--gap-s);

    padding: var(--gap-m);
    box-sizing: border-box;

    border-radius: var(--border-radius-m);
    background: var(--background-vip-drawer);
  }

  .trivia-skeleton-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);

    margin: 0;
    padding: 0;
    list-style: none;
    min-width: 0;

    li {
      display: flex;
      align-items: center;
      gap: var(--gap-s);
    }
  }

  .trivia-skeleton-icon {
    flex-shrink: 0;
    width: var(--trakttime-icon-sm);
    height: var(--trakttime-icon-sm);
    border-radius: 50%;
    @include shimmer-bg-elevated;
  }

  .trivia-skeleton-line {
    height: 0.875rem;
    border-radius: var(--border-radius-s);
    @include shimmer-bg-elevated;
  }

  .trivia-skeleton-chevron {
    flex-shrink: 0;
    width: var(--trakttime-icon-md);
    height: var(--trakttime-icon-md);
    border-radius: 50%;
    @include shimmer-bg-elevated;
  }
</style>
