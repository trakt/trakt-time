<script lang="ts">
  import MoreIcon from '$lib/components/icons/MoreIcon.svelte';
  import type { MarkAsWatchedStoreProps } from '$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts';
  import WatchedRow from '$lib/components/watched-row/WatchedRow.svelte';
  import * as m from '$lib/paraglide/messages.js';

  type Props = {
    watchedProps: MarkAsWatchedStoreProps;
    title: string;
    /** When provided, also renders a More-actions button that triggers it. */
    onMore?: () => void;
  };

  const { watchedProps, title, onMore }: Props = $props();
</script>

<div class="summary-actions-row">
  <WatchedRow {watchedProps} {title} />

  {#if onMore}
    <button
      type="button"
      class="summary-more-btn icon-button-round"
      onclick={onMore}
      aria-label={m.button_label_more_actions({ title })}
    >
      <MoreIcon />
    </button>
  {/if}
</div>

<style lang="scss">
  .summary-actions-row {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    width: 100%;
  }

  .summary-more-btn {
    flex-shrink: 0;
    width: var(--ni-48);
    height: var(--ni-48);
    border: var(--border-thickness-xs) solid var(--color-border);
    cursor: pointer;
    padding: 0;

    :global(svg) {
      width: var(--ni-20);
      height: var(--ni-20);
    }
  }
</style>
