<script lang="ts">
  import { useList } from '$lib/sections/components/lists-drawer/useList.ts';
  import type { UserList } from '$lib/requests/queries/users/userListsQuery.ts';
  import * as m from '$lib/paraglide/messages.js';

  type Props = {
    list: UserList;
    type: 'show' | 'movie';
    id: number;
    isAdded: boolean;
  };
  const { list, type, id, isAdded }: Props = $props();

  const { addToList, removeFromList, isListUpdating } = $derived(
    useList({ list, type, media: { id } }),
  );

  /*
   * Optimistic toggle: flip the visual state immediately so the tap feels
   * instant, but the source of truth is `isAdded` from the parent (driven by
   * useListedOnIds). The Listed(type) invalidation refreshes that query when
   * the request completes, so the prop catches up and our local override
   * dissolves.
   */
  let pending = $state<boolean | null>(null);
  const effectiveAdded = $derived(pending ?? isAdded);

  $effect(() => {
    isAdded;
    pending = null;
  });

  async function toggle() {
    if ($isListUpdating) return;
    pending = !effectiveAdded;
    if (effectiveAdded) {
      await removeFromList();
    } else {
      await addToList();
    }
  }
</script>

<button
  class="list-item"
  class:is-added={effectiveAdded}
  onclick={toggle}
  disabled={$isListUpdating}
  aria-pressed={effectiveAdded}
  aria-label="{effectiveAdded ? 'Remove from' : 'Add to'} {list.name}"
>
  <span class="list-item-text">
    <span class="list-item-name">{list.name}</span>
    <span class="list-item-count">{list.count} {m.text_items_unit()}</span>
  </span>
  <span class="list-item-check" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  </span>
</button>

<style lang="scss">
  .list-item {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    width: 100%;
    min-height: var(--ni-56);
    padding: var(--gap-xs) var(--gap-m);
    border: none;
    background: none;
    color: var(--color-text-primary);
    font: inherit;
    text-align: start;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background var(--transition-increment) ease-in-out;

    &:hover,
    &:focus-visible {
      background: color-mix(in srgb, var(--color-text-primary) 5%, transparent);
    }

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }

  .list-item-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--ni-2);
  }

  .list-item-name {
    font-size: 0.9375rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .list-item-count {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .list-item-check {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--ni-28);
    height: var(--ni-28);
    border-radius: 50%;
    border: var(--border-thickness-xs) solid
      color-mix(in srgb, var(--color-text-secondary) 45%, transparent);
    color: transparent;
    transition:
      background var(--transition-increment) ease-in-out,
      border-color var(--transition-increment) ease-in-out,
      color var(--transition-increment) ease-in-out;

    svg {
      width: var(--ni-16);
      height: var(--ni-16);
    }
  }

  .list-item.is-added .list-item-check {
    border-color: var(--trakttime-accent);
    background: var(--trakttime-accent);
    color: var(--trakttime-accent-foreground);
  }
</style>
