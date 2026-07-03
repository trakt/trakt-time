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

  /* Mirrors the GroupHeader footprint (centered pill divider). */
  .watchlist-skeleton-header {
    display: flex;
    justify-content: center;
    padding: var(--gap-s) 0;
  }

  .watchlist-skeleton-pill {
    width: var(--ni-96);
    /* Pill line box: 0.625rem text + 4px vertical padding. */
    height: 1.1875rem;
    border-radius: var(--border-radius-xxl);
    @include shimmer-bg;
  }
</style>
