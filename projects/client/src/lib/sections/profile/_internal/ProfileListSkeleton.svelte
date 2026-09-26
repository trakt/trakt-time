<script lang="ts">
  const { count }: { count: number } = $props();
</script>

{#each Array(count) as _, index (index)}
  <div class="profile-list-skeleton" aria-hidden="true">
    <span class="skeleton-poster"></span>
    <span class="skeleton-text">
      <span class="skeleton-line skeleton-line--title"></span>
      <span class="skeleton-line skeleton-line--subtitle"></span>
    </span>
  </div>
{/each}

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .profile-list-skeleton {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    padding: var(--gap-s) var(--gap-m);
  }

  .skeleton-poster {
    flex-shrink: 0;
    width: var(--ni-40);
    height: var(--ni-60);
    border-radius: var(--border-radius-s);
    @include shimmer-bg-elevated;
  }

  .skeleton-text {
    display: flex;
    flex-direction: column;
    gap: var(--ni-4);
    flex: 1;
  }

  .skeleton-line {
    border-radius: var(--border-radius-s);
    @include shimmer-bg-elevated;
  }

  .skeleton-line--title {
    width: 60%;
    height: 1.125rem;
  }

  .skeleton-line--subtitle {
    width: 35%;
    height: 1rem;
  }
</style>
