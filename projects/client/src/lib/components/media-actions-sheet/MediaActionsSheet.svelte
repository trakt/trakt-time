<script lang="ts">
  import { RatingGroup } from 'bits-ui';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import { useFavorites } from '$lib/sections/media-actions/favorite/useFavorites.ts';
  import { useListedOnIds } from '$lib/sections/media-actions/list/useListedOnIds.ts';
  import { useRatings } from '$lib/sections/summary/components/rating/useRatings.ts';
  import { useWatchlist } from '$lib/sections/media-actions/watchlist/useWatchlist.ts';
  import { userListsQuery } from '$lib/requests/queries/users/userListsQuery.ts';
  import HeartIcon from '$lib/components/icons/HeartIcon.svelte';
  import StarIcon from '$lib/components/icons/StarIcon.svelte';
  import ListToggleItem from './ListToggleItem.svelte';
  import * as m from '$lib/paraglide/messages.js';

  type Props = {
    type: 'show' | 'movie';
    id: number;
    slug: string;
    title: string;
    isRateable: boolean;
    isOpen: boolean;
    onClose: () => void;
  };

  const { type, id, slug, title, isRateable, isOpen, onClose }: Props =
    $props();

  const { pendingRating, current, addRating, removeRating } = $derived(
    useRatings({ type, id }),
  );

  const { isFavorited, isUpdatingFavorite, addToFavorites, removeFromFavorites } =
    $derived(useFavorites({ type, id, title }));

  const { isWatchlisted, addToWatchlist, removeFromWatchlist, isWatchlistUpdating } =
    $derived(useWatchlist({ type, media: { id } }));

  const listsQuery = useQuery(userListsQuery({}));
  const lists = $derived($listsQuery.data ?? []);

  const { listedOnIds } = $derived(useListedOnIds({ type, slug }));

  // Trakt uses 1–10; bits-ui RatingGroup uses 0–5 with 0.5 steps (allowHalf).
  // Divide by 2 to convert in, multiply by 2 to convert out.
  const ratingValue = $derived((($pendingRating ?? $current?.rating) ?? 0) / 2);

  function onRatingChange(value: number) {
    if (value === 0) {
      removeRating();
    } else {
      addRating(value * 2);
    }
  }

  function toggleFavorite() {
    if ($isFavorited) removeFromFavorites();
    else addToFavorites();
  }

  function toggleWatchlist() {
    if ($isWatchlisted) removeFromWatchlist();
    else addToWatchlist();
  }

  function onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="sheet-backdrop"
    onclick={onBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-label={m.header_rate_or_favorite()}
    tabindex="-1"
  >
    <div class="sheet">
      <div class="sheet-handle"></div>
      <p class="sheet-title">{title}</p>

      <div class="actions-row" class:no-rating={!isRateable}>
        {#if isRateable}
          <div class="action-group action-group--rating">
            <span class="action-label">{m.header_rate_now()}</span>
            <RatingGroup.Root
              class="stars-row"
              value={ratingValue}
              onValueChange={onRatingChange}
              allowHalf
              max={5}
              disabled={$pendingRating !== null}
            >
              {#snippet children({ items })}
                {#each items as item (item.index)}
                  <RatingGroup.Item index={item.index} class="star-btn">
                    <StarIcon
                      fill={item.state === 'active'
                        ? 'full'
                        : item.state === 'partial'
                          ? 'half'
                          : 'none'}
                    />
                  </RatingGroup.Item>
                {/each}
              {/snippet}
            </RatingGroup.Root>
          </div>
        {/if}

        <div class="action-group action-group--icon">
          <button
            class="icon-action-btn"
            class:is-active={$isFavorited}
            disabled={$isUpdatingFavorite}
            onclick={toggleFavorite}
            aria-label={$isFavorited
              ? m.button_label_remove_from_favorites({ title })
              : m.button_label_add_to_favorites({ title })}
          >
            <HeartIcon />
          </button>
          <span class="action-label">{m.button_text_add_to_favorites()}</span>
        </div>

        <div class="action-group action-group--icon">
          <button
            class="icon-action-btn"
            class:is-active={$isWatchlisted}
            disabled={$isWatchlistUpdating}
            onclick={toggleWatchlist}
            aria-label={$isWatchlisted
              ? m.button_label_remove_from_watchlist({ title })
              : m.button_label_add_to_watchlist({ title })}
          >
            {#if $isWatchlisted}
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            {:else}
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            {/if}
          </button>
          <span class="action-label">{m.button_text_watchlist()}</span>
        </div>
      </div>

      {#if lists.length > 0}
        <div class="lists-section">
          <span class="action-label">{m.page_title_lists()}</span>
          <div class="lists-row">
            {#each lists as list (list.id)}
              <ListToggleItem
                {list}
                {type}
                {id}
                isAdded={$listedOnIds.includes(list.id)}
              />
            {/each}
          </div>
        </div>
      {/if}

      <button class="close-btn" onclick={onClose} aria-label={m.button_text_done()}>{m.button_text_done()}</button>
    </div>
  </div>
{/if}

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .sheet-backdrop {
    position: fixed;
    inset: 0;
    z-index: var(--layer-overlay);
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    animation: fade-in 0.2s ease;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .sheet {
    width: 100%;
    max-width: var(--trakttime-max-width);
    background: var(--color-card-background);
    border-radius: var(--border-radius-l) var(--border-radius-l) 0 0;
    padding: var(--gap-s) var(--gap-m)
      calc(
        var(--trakttime-bottom-nav-height) + var(--gap-m) +
          env(safe-area-inset-bottom, 0px)
      );
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
    animation: slide-up 0.25s cubic-bezier(0.32, 0.72, 0, 1);
  }

  @keyframes slide-up {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  .sheet-handle {
    width: var(--ni-36);
    height: var(--ni-4);
    border-radius: var(--ni-2);
    background: var(--color-border);
    align-self: center;
    margin-bottom: var(--gap-xs);
  }

  .sheet-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actions-row {
    display: flex;
    align-items: flex-start;
    gap: var(--gap-m);

    &.no-rating {
      justify-content: space-around;
    }
  }

  .action-group {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
  }

  .action-group--rating {
    flex: 1;
  }

  .action-label {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  :global(.stars-row) {
    display: flex;
    gap: var(--gap-xs);
    align-items: center;

    :global(svg) {
      width: var(--ni-28);
      height: var(--ni-28);
      color: var(--trakttime-accent);
    }
  }

  :global(.star-btn) {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--trakttime-accent);
    display: flex;
    align-items: center;
    transition: transform 0.1s ease;

    &:disabled {
      opacity: 0.6;
    }

    &:active:not(:disabled) {
      transform: scale(0.9);
    }
  }

  .action-group--icon {
    align-items: center;
    gap: var(--gap-xs);
  }

  .icon-action-btn {
    width: var(--ni-48);
    height: var(--ni-48);
    border-radius: var(--border-radius-m);
    border: 1.5px solid var(--color-border);
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);
    transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;

    svg,
    :global(svg) {
      width: var(--ni-22);
      height: var(--ni-22);
    }

    &.is-active {
      color: var(--trakttime-accent);
      border-color: var(--trakttime-accent);
      background: color-mix(in srgb, var(--trakttime-accent) 12%, transparent);
    }

    &:disabled {
      opacity: 0.6;
    }
  }

  .lists-section {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
  }

  .lists-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-xs);
  }

  .close-btn {
    background: var(--trakttime-accent);
    border: none;
    border-radius: var(--border-radius-m);
    color: var(--color-background);
    font-size: 0.9375rem;
    font-weight: 700;
    padding: var(--gap-m);
    cursor: pointer;
    width: 100%;
    margin-top: var(--gap-xs);
  }
</style>
