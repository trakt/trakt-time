<script lang="ts">
  import { RatingGroup } from 'bits-ui';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import { useFavorites } from '$lib/sections/media-actions/favorite/useFavorites.ts';
  import { useHasWatched } from '$lib/sections/media-actions/mark-as-watched/useHasWatched.ts';
  import { useListedOnIds } from '$lib/sections/media-actions/list/useListedOnIds.ts';
  import { useRatings } from '$lib/sections/summary/components/rating/useRatings.ts';
  import { useWatchlist } from '$lib/sections/media-actions/watchlist/useWatchlist.ts';
  import { userListsQuery } from '$lib/requests/queries/users/userListsQuery.ts';
  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
  import HeartIcon from '$lib/components/icons/HeartIcon.svelte';
  import StarIcon from '$lib/components/icons/StarIcon.svelte';
  import CreateListPill from './CreateListPill.svelte';
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

  const { hasWatched } = $derived(useHasWatched({ type, id }));

  const listsQuery = useQuery(userListsQuery({}));
  const lists = $derived($listsQuery.data ?? []);

  const { listedOnIds } = $derived(useListedOnIds({ type, slug }));

  // Trakt uses 1–10; bits-ui RatingGroup uses 0–5 with 0.5 steps (allowHalf).
  // Divide by 2 to convert in, multiply by 2 to convert out.
  const traktRating = $derived($pendingRating ?? $current?.rating ?? 0);
  const ratingValue = $derived(traktRating / 2);
  const ratingLabel = $derived(
    traktRating > 0 ? `${traktRating} / 10` : null,
  );

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

  const ratingDisabled = $derived($pendingRating !== null || !$hasWatched);
  const favoriteDisabled = $derived($isUpdatingFavorite || !$hasWatched);
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

      <header class="sheet-header">
        <p class="sheet-title">{title}</p>
        <button
          type="button"
          class="sheet-close"
          onclick={onClose}
          aria-label={m.button_text_done()}
        >
          <CloseIcon />
        </button>
      </header>

      {#if isRateable}
        <section class="sheet-section">
          <div class="section-heading">
            <span class="section-label">{m.header_rate_now()}</span>
            {#if ratingLabel}
              <span class="rating-tally">{ratingLabel}</span>
            {/if}
          </div>
          <RatingGroup.Root
            class="stars-row"
            value={ratingValue}
            onValueChange={onRatingChange}
            allowHalf
            max={5}
            disabled={ratingDisabled}
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
        </section>
      {/if}

      <section class="sheet-section">
        <span class="section-label">{m.header_quick_actions()}</span>
        <div class="action-pills">
          <button
            type="button"
            class="action-pill"
            class:is-active={$isFavorited}
            disabled={favoriteDisabled}
            onclick={toggleFavorite}
            aria-pressed={$isFavorited}
            aria-label={$isFavorited
              ? m.button_label_remove_from_favorites({ title })
              : m.button_label_add_to_favorites({ title })}
          >
            <HeartIcon />
            <span>
              {$isFavorited
                ? m.button_text_added_to_favorites()
                : m.button_text_add_to_favorites()}
            </span>
          </button>

          <button
            type="button"
            class="action-pill"
            class:is-active={$isWatchlisted}
            disabled={$isWatchlistUpdating}
            onclick={toggleWatchlist}
            aria-pressed={$isWatchlisted}
            aria-label={$isWatchlisted
              ? m.button_label_remove_from_watchlist({ title })
              : m.button_label_add_to_watchlist({ title })}
          >
            {#if $isWatchlisted}
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path
                  d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                />
              </svg>
            {:else}
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            {/if}
            <span>
              {$isWatchlisted
                ? m.button_text_on_watchlist()
                : m.button_text_watchlist()}
            </span>
          </button>
        </div>
        {#if !$hasWatched}
          <p class="watch-first-hint">{m.hint_mark_as_watched_to_rate()}</p>
        {/if}
      </section>

      <section class="sheet-section">
        <span class="section-label">{m.page_title_lists()}</span>
        <div class="lists-row">
          {#each lists as list (list.id)}
            <ListToggleItem
              {list}
              {type}
              {id}
              isAdded={$listedOnIds.includes(list.id)}
            />
          {/each}
          <CreateListPill />
        </div>
      </section>
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
    gap: var(--gap-l);
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

  .sheet-header {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    margin: 0;
  }

  .sheet-title {
    flex: 1;
    min-width: 0;
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sheet-close {
    flex-shrink: 0;
    width: var(--ni-32);
    height: var(--ni-32);
    border-radius: 50%;
    background: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
    border: none;
    color: var(--color-text-secondary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
    -webkit-tap-highlight-color: transparent;

    :global(svg) {
      width: var(--ni-16);
      height: var(--ni-16);
    }

    &:hover,
    &:focus-visible {
      background: color-mix(in srgb, var(--color-text-primary) 12%, transparent);
      color: var(--color-text-primary);
    }
  }

  .sheet-section {
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);
  }

  .section-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--gap-s);
  }

  .section-label {
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .rating-tally {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--trakttime-accent);
    letter-spacing: 0;
    text-transform: none;
  }

  :global(.stars-row) {
    display: flex;
    gap: var(--gap-s);
    align-items: center;
    justify-content: space-between;

    :global(svg) {
      width: var(--ni-32);
      height: var(--ni-32);
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
      opacity: 0.4;
      cursor: not-allowed;
    }

    &:active:not(:disabled) {
      transform: scale(0.9);
    }
  }

  .action-pills {
    display: flex;
    gap: var(--gap-s);
  }

  .action-pill {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--gap-xs);
    padding: var(--gap-s) var(--gap-m);
    border-radius: var(--border-radius-m);
    border: 1.5px solid var(--color-border);
    background: none;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
    -webkit-tap-highlight-color: transparent;

    svg,
    :global(svg) {
      width: var(--ni-18);
      height: var(--ni-18);
      flex-shrink: 0;
    }

    &.is-active {
      color: var(--trakttime-accent);
      border-color: var(--trakttime-accent);
      background: color-mix(in srgb, var(--trakttime-accent) 12%, transparent);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .watch-first-hint {
    margin: 0;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    text-align: center;
    font-style: italic;
  }

  .lists-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-xs);
  }
</style>
