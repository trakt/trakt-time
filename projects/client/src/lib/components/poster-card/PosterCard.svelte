<script lang="ts">
  import CrossOriginImage from '$lib/features/image/components/CrossOriginImage.svelte';
  import HeartIcon from '$lib/components/icons/HeartIcon.svelte';
  import Link from '$lib/components/link/Link.svelte';
  import { useFavorites } from '$lib/sections/media-actions/favorite/useFavorites.ts';
  import { useWatchlist } from '$lib/sections/media-actions/watchlist/useWatchlist.ts';
  import * as m from '$lib/paraglide/messages.js';

  type Props = {
    type: 'show' | 'movie';
    href: string;
    id: number;
    title: string;
    posterUrl: string;
    mode?: 'watchlist' | 'favorite';
  };

  const { type, href, id, title, posterUrl, mode = 'watchlist' }: Props = $props();

  const { isFavorited, isUpdatingFavorite, removeFromFavorites } = $derived(
    useFavorites({ type, id, title }),
  );

  const { isWatchlisted, addToWatchlist, removeFromWatchlist, isWatchlistUpdating } =
    $derived(useWatchlist({ type, media: { id } }));

  const onActionClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (mode === 'favorite') {
      removeFromFavorites();
    } else {
      ($isWatchlisted ? removeFromWatchlist : addToWatchlist)();
    }
  };
</script>

<div class="poster-card">
  <div class="poster-frame">
    <Link {href} label={title}>
      <CrossOriginImage src={posterUrl} alt={title} />
    </Link>
    <button
      class="action-btn"
      class:is-watchlisted={mode === 'watchlist' && $isWatchlisted}
      class:is-favorited={mode === 'favorite'}
      disabled={(mode === 'favorite' && $isUpdatingFavorite) || (mode === 'watchlist' && $isWatchlistUpdating)}
      onclick={onActionClick}
      aria-label={mode === 'favorite'
        ? m.button_label_remove_from_favorites({ title })
        : $isWatchlisted
          ? m.button_label_remove_from_watchlist({ title })
          : m.button_label_add_to_watchlist({ title })}
    >
      {#if mode === 'favorite'}
        <HeartIcon />
      {:else if $isWatchlisted}
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      {/if}
    </button>
  </div>
  <p class="poster-title">{title}</p>
</div>

<style lang="scss">
  .poster-card {
    flex-shrink: 0;
    width: var(--trakttime-poster-card-width);
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxs);
  }

  .poster-frame {
    position: relative;
    border-radius: var(--border-radius-m);
    overflow: hidden;
    aspect-ratio: 2 / 3;
  }

  :global(.poster-frame a) {
    display: block;
    width: 100%;
    height: 100%;

    :global(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  .action-btn {
    position: absolute;
    top: var(--gap-xxs);
    right: var(--gap-xxs);
    width: var(--trakttime-watchlist-btn-size);
    height: var(--trakttime-watchlist-btn-size);
    border-radius: var(--border-radius-s);
    border: none;
    background: var(--trakttime-accent);
    color: var(--color-background);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    transition: background-color 0.15s ease;

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }

    &.is-watchlisted {
      background: color-mix(in srgb, var(--trakttime-accent) 30%, transparent);
      color: var(--trakttime-accent);
    }

    &.is-favorited {
      background: color-mix(in srgb, var(--trakttime-accent) 30%, transparent);
      color: var(--trakttime-accent);
    }

    svg,
    :global(svg) {
      width: var(--ni-14);
      height: var(--ni-14);
    }
  }

  .poster-title {
    font-size: 0.7rem;
    line-height: 1rem;
    color: var(--color-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0;
  }
</style>
