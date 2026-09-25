<script lang="ts">
  import { RatingGroup } from 'bits-ui';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import { useFavorites } from '$lib/sections/media-actions/favorite/useFavorites.ts';
  import { useHasWatched } from '$lib/sections/media-actions/mark-as-watched/useHasWatched.ts';
  import { useListedOnIds } from '$lib/sections/media-actions/list/useListedOnIds.ts';
  import {
    type MarkAsWatchedStoreProps,
    useMarkAsWatched,
  } from '$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts';
  import { useRatings } from '$lib/sections/summary/components/rating/useRatings.ts';
  import { useWatchlist } from '$lib/sections/media-actions/watchlist/useWatchlist.ts';
  import { useDropShow } from '$lib/sections/media-actions/drop/useDropShow.ts';
  import { userListsQuery } from '$lib/requests/queries/users/userListsQuery.ts';
  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
  import HeartIcon from '$lib/components/icons/HeartIcon.svelte';
  import LoaderIcon from '$lib/components/icons/LoaderIcon.svelte';
  import TrackIcon from '$lib/components/icons/TrackIcon.svelte';
  import StarIcon from '$lib/components/icons/StarIcon.svelte';
  import CreateListRow from './CreateListRow.svelte';
  import ListToggleItem from './ListToggleItem.svelte';
  import * as m from '$lib/paraglide/messages.js';

  type Props = {
    type: 'show' | 'movie';
    id: number;
    slug: string;
    title: string;
    isRateable: boolean;
    /** When provided, the sheet can mark the title as watched in-place. */
    watchedProps?: MarkAsWatchedStoreProps;
    isOpen: boolean;
    onClose: () => void;
  };

  const {
    type,
    id,
    slug,
    title,
    isRateable,
    watchedProps,
    isOpen,
    onClose,
  }: Props = $props();

  const { pendingRating, isSubmitting, current, addRating, removeRating } =
    $derived(useRatings({ type, id }));

  const { isFavorited, isUpdatingFavorite, addToFavorites, removeFromFavorites } =
    $derived(useFavorites({ type, id, title }));

  const { isWatchlisted, addToWatchlist, removeFromWatchlist, isWatchlistUpdating } =
    $derived(useWatchlist({ type, media: { id } }));

  const { hasWatched } = $derived(useHasWatched({ type, id }));

  const { isDropped, isUpdatingDrop, dropShow, restoreShow } = $derived(
    useDropShow({ id, title }),
  );
  const isDroppable = $derived(type === 'show' && $hasWatched);

  const watchedHooks = $derived(
    watchedProps ? useMarkAsWatched(watchedProps) : null,
  );
  const isMarkingAsWatched = $derived(watchedHooks?.isMarkingAsWatched);
  const isWatchable = $derived(watchedHooks?.isWatchable ?? false);

  function markAsWatchedNow() {
    watchedHooks?.markAsWatched();
  }

  const LIST_PREVIEW_COUNT = 5;

  const listsQuery = useQuery(userListsQuery({}));
  const lists = $derived($listsQuery.data ?? []);

  let showAllLists = $state(false);
  $effect(() => {
    if (!isOpen) showAllLists = false;
  });

  const visibleLists = $derived(
    showAllLists ? lists : lists.slice(0, LIST_PREVIEW_COUNT),
  );
  const hasHiddenLists = $derived(visibleLists.length < lists.length);

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

  const ratingDisabled = $derived($isSubmitting || !$hasWatched);
  const favoriteDisabled = $derived($isUpdatingFavorite || !$hasWatched);
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="bottom-sheet-backdrop"
    onclick={onBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-label={m.header_more_options()}
    tabindex="-1"
  >
    <div class="bottom-sheet sheet">
      <div class="bottom-sheet-handle"></div>

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

        {#if watchedHooks && !$hasWatched && isWatchable}
          <button
            type="button"
            class="action-pill action-pill--primary"
            disabled={$isMarkingAsWatched}
            onclick={markAsWatchedNow}
            aria-label={m.button_label_mark_as_watched({ title })}
          >
            {#if $isMarkingAsWatched}
              <LoaderIcon />
            {:else}
              <TrackIcon state="unwatched" />
            {/if}
            <span>{m.button_text_mark_as_watched()}</span>
          </button>
          <p class="watch-first-hint">{m.hint_mark_as_watched_to_rate()}</p>
        {/if}

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

          {#if isDroppable}
            <button
              type="button"
              class="action-pill"
              class:is-active={$isDropped}
              disabled={$isUpdatingDrop}
              onclick={() => ($isDropped ? restoreShow() : dropShow())}
              aria-pressed={$isDropped}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                {#if $isDropped}
                  <path
                    d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18z"
                  />
                {:else}
                  <path d="M6 6h12v12H6z" />
                {/if}
              </svg>
              <span>
                {$isDropped ? m.button_text_restore_show() : m.button_text_drop_show()}
              </span>
            </button>
          {/if}
        </div>
      </section>

      <section class="sheet-section">
        <span class="section-label">{m.page_title_lists()}</span>
        <div class="list-card">
          {#each visibleLists as list (list.id)}
            <ListToggleItem
              {list}
              {type}
              {id}
              isAdded={$listedOnIds.includes(list.id)}
            />
          {/each}
          {#if hasHiddenLists}
            <button
              type="button"
              class="list-card-more"
              onclick={() => (showAllLists = true)}
            >
              <span>{m.button_label_view_all_lists()}</span>
              <span class="list-card-more-count">{lists.length}</span>
            </button>
          {/if}
          <CreateListRow />
        </div>
      </section>
    </div>
  </div>
{/if}

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .sheet {
    padding-top: var(--gap-s);
    padding-inline: var(--gap-m);
    display: flex;
    flex-direction: column;
    gap: var(--gap-l);
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
    font-family: var(--trakttime-font-heading);
    font-size: 1.375rem;
    font-weight: 600;
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
    font-family: var(--trakttime-font-heading);
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .rating-tally {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--trakttime-accent);
    letter-spacing: 0;
    text-transform: none;
  }

  /* bits-ui's RatingGroup renders <div>s, not <button>s — disabled state
     comes through as `data-disabled=""` rather than the native attr.
     Selectors are fully wrapped in :global so Svelte's analyser doesn't
     mark them dead (and so the attribute selector survives scoping). */
  :global(.stars-row) {
    display: flex;
    gap: var(--gap-xs);
    align-items: center;
    justify-content: flex-start;
  }

  :global(.stars-row svg) {
    width: var(--ni-32);
    height: var(--ni-32);
    color: var(--trakttime-accent);
    transition: color 0.15s ease;
  }

  :global(.stars-row[data-disabled]),
  :global(.star-btn[data-disabled]) {
    opacity: 0.4;
  }

  :global(.stars-row[data-disabled] svg),
  :global(.star-btn[data-disabled] svg) {
    color: color-mix(in srgb, var(--color-text-secondary) 70%, transparent);
  }

  :global(.star-btn) {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: transform 0.1s ease;
  }

  :global(.star-btn[data-disabled]) {
    cursor: not-allowed;
  }

  :global(.star-btn:active:not([data-disabled])) {
    transform: scale(0.9);
  }

  .action-pills {
    display: grid;
    grid-auto-columns: 1fr;
    grid-auto-flow: column;
    gap: var(--gap-xs);
  }

  .action-pill {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--gap-xxs);
    min-height: var(--ni-72);
    padding: var(--gap-s) var(--gap-xs);
    border-radius: var(--trakttime-radius-card);
    border: none;
    background: var(--color-floating-background);
    color: var(--color-text-primary);
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 500;
    text-align: center;
    cursor: pointer;
    transition:
      color var(--transition-increment) ease-in-out,
      background var(--transition-increment) ease-in-out;
    -webkit-tap-highlight-color: transparent;

    svg,
    :global(svg) {
      width: var(--ni-20);
      height: var(--ni-20);
      flex-shrink: 0;
    }

    &.is-active {
      color: var(--trakttime-accent);
      background: color-mix(in srgb, var(--trakttime-accent) 14%, transparent);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .action-pill--primary {
    flex-direction: row;
    gap: var(--gap-xs);
    min-height: var(--ni-52);
    border-radius: var(--trakttime-radius-pill);
    background: var(--trakttime-accent);
    color: var(--trakttime-accent-foreground);
    font-size: 1rem;
    font-weight: 600;
    width: 100%;

    :global(svg) {
      animation: none;
    }

    &:hover,
    &:focus-visible {
      background: color-mix(in srgb, var(--trakttime-accent) 88%, white);
    }

    &:disabled {
      opacity: 0.7;
    }
  }

  .watch-first-hint {
    margin: 0;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    text-align: center;
    font-style: italic;
  }


  .list-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: var(--trakttime-radius-card);
    background: var(--color-floating-background);

    > :global(* + *) {
      border-top: var(--ni-1) solid var(--color-border);
    }
  }

  .list-card-more {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--gap-s);
    min-height: var(--ni-48);
    padding: 0 var(--gap-m);
    border: none;
    background: none;
    color: var(--trakttime-accent);
    font: inherit;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .list-card-more-count {
    color: var(--color-text-secondary);
    font-weight: 500;
  }
</style>
