<script lang="ts">
  import MediaRowSkeleton from '$lib/components/media-card/MediaRowSkeleton.svelte';

  const SKELETON_ROW_COUNT = 7;
</script>

<div class="watchlist-skeleton" aria-hidden="true">
  <div class="watchlist-skeleton-header">
    <div class="watchlist-skeleton-pill"></div>
  </div>
  {#each Array(SKELETON_ROW_COUNT) as _, i (`ws-${i}`)}
    <MediaRowSkeleton />
  {/each}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .watchlist-skeleton {
    display: flex;
    flex-direction: column;
  }

  .watchlist-skeleton-header {
    padding: var(--gap-m) var(--gap-m) var(--gap-s);
  }

  .watchlist-skeleton-pill {
    width: var(--ni-120);
    height: 1.5625rem;
    border-radius: var(--border-radius-s);
    @include shimmer-bg;
  }
</style>
