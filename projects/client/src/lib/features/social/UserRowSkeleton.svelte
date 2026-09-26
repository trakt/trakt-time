<script lang="ts">
  const { count }: { count: number } = $props();
</script>

{#each Array(count) as _, index (index)}
  <div class="user-row user-row-skeleton" aria-hidden="true">
    <span class="skeleton-avatar"></span>
    <span class="skeleton-text">
      <span class="skeleton-line skeleton-line--name"></span>
      <span class="skeleton-line skeleton-line--detail"></span>
    </span>
    <span class="skeleton-action"></span>
  </div>
{/each}

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .user-row-skeleton {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    padding: var(--gap-s) var(--gap-s) var(--gap-s) var(--gap-m);
  }

  .skeleton-avatar {
    flex-shrink: 0;
    width: var(--ni-44);
    height: var(--ni-44);
    border-radius: 50%;
    @include shimmer-bg-elevated;
  }

  .skeleton-text {
    display: flex;
    flex-direction: column;
    gap: var(--ni-2);
    flex: 1;
  }

  .skeleton-line,
  .skeleton-action {
    @include shimmer-bg-elevated;
  }

  .skeleton-line {
    border-radius: var(--border-radius-s);
  }

  .skeleton-line--name {
    width: 45%;
    height: 1.125rem;
  }

  .skeleton-line--detail {
    width: 30%;
    height: 1rem;
  }

  .skeleton-action {
    flex-shrink: 0;
    width: var(--ni-96);
    height: var(--ni-36);
    border-radius: var(--trakttime-radius-pill);
  }
</style>
