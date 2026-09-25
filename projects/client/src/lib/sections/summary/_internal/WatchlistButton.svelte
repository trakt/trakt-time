<script lang="ts">
  import BookmarkIcon from '$lib/components/icons/BookmarkIcon.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { useWatchlist } from '$lib/sections/media-actions/watchlist/useWatchlist.ts';

  type Props = {
    type: 'show' | 'movie';
    id: number;
    title: string;
  };

  const { type, id, title }: Props = $props();

  const { isWatchlisted, isWatchlistUpdating, addToWatchlist, removeFromWatchlist } =
    $derived(useWatchlist({ type, media: { id } }));

  function toggle() {
    if ($isWatchlisted) removeFromWatchlist();
    else addToWatchlist();
  }
</script>

<button
  type="button"
  class="watchlist-btn"
  class:is-active={$isWatchlisted}
  disabled={$isWatchlistUpdating}
  aria-pressed={$isWatchlisted}
  aria-label={$isWatchlisted
    ? m.button_label_remove_from_watchlist({ title })
    : m.button_label_add_to_watchlist({ title })}
  onclick={toggle}
>
  <BookmarkIcon filled={$isWatchlisted} />
</button>

<style lang="scss">
  .watchlist-btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--ni-48);
    height: var(--ni-48);
    padding: 0;
    border: var(--border-thickness-xs) solid
      color-mix(in srgb, var(--color-text-secondary) 45%, transparent);
    border-radius: 50%;
    background: none;
    color: var(--color-text-primary);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition:
      border-color var(--transition-increment) ease-in-out,
      background var(--transition-increment) ease-in-out,
      color var(--transition-increment) ease-in-out;

    &.is-active {
      border-color: transparent;
      background: var(--trakttime-gradient);
      color: var(--trakttime-accent-foreground);
    }

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }

    :global(svg) {
      width: var(--ni-20);
      height: var(--ni-20);
    }
  }
</style>
