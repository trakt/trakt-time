<script lang="ts">
  import WatchedRow from '$lib/components/watched-row/WatchedRow.svelte';
  import RenderFor from '$lib/guards/RenderFor.svelte';
  import type { MarkAsWatchedStoreProps } from '$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts';
  import WatchlistButton from './WatchlistButton.svelte';

  type Props = {
    watchedProps: MarkAsWatchedStoreProps;
    title: string;
    watchlist?: { type: 'show' | 'movie'; id: number };
  };

  const { watchedProps, title, watchlist }: Props = $props();
</script>

<div class="summary-actions-row">
  <WatchedRow {watchedProps} {title} />

  {#if watchlist}
    <RenderFor audience="authenticated">
      <WatchlistButton type={watchlist.type} id={watchlist.id} {title} />
    </RenderFor>
  {/if}
</div>

<style lang="scss">
  .summary-actions-row {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    width: 100%;
  }
</style>
