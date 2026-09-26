<script lang="ts">
  const { count }: { count: number } = $props();
</script>

{#each Array(count) as _, index (index)}
  <div class="feed-item-skeleton" aria-hidden="true">
    <span class="skeleton-avatar"></span>
    <span class="skeleton-body">
      <span class="skeleton-line skeleton-line--who"></span>
      <span class="skeleton-line skeleton-line--title"></span>
      <span class="skeleton-line skeleton-line--detail"></span>
    </span>
    <span class="skeleton-thumb"></span>
  </div>
{/each}

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .feed-item-skeleton {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) var(--ni-120);
    gap: var(--gap-s);
    align-items: start;
    padding: var(--gap-s) var(--trakttime-page-gutter);
  }

  .skeleton-avatar,
  .skeleton-line,
  .skeleton-thumb {
    @include shimmer-bg;
  }

  .skeleton-avatar {
    width: var(--ni-32);
    height: var(--ni-32);
    border-radius: 50%;
  }

  .skeleton-body {
    display: flex;
    flex-direction: column;
    gap: var(--ni-4);
  }

  .skeleton-line {
    border-radius: var(--border-radius-s);
  }

  .skeleton-line--who {
    width: 50%;
    height: 1rem;
  }

  .skeleton-line--title {
    width: 70%;
    height: 1.125rem;
  }

  .skeleton-line--detail {
    width: 40%;
    height: 1rem;
  }

  .skeleton-thumb {
    aspect-ratio: 16 / 9;
    border-radius: var(--border-radius-m);
  }
</style>
