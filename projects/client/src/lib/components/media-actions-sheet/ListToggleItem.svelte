<script lang="ts">
  import { useList } from '$lib/sections/components/lists-drawer/useList.ts';
  import type { UserList } from '$lib/requests/queries/users/userListsQuery.ts';

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
  aria-label="{effectiveAdded ? 'Remove from' : 'Add to'} {list.name}"
>
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {#if effectiveAdded}
      <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
    {:else}
      <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z" />
    {/if}
  </svg>
  <span>{list.name}</span>
</button>

<style lang="scss">
  .list-item {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
    background: none;
    border: var(--ni-1) solid var(--color-border);
    border-radius: var(--border-radius-m);
    padding: var(--gap-xs) var(--gap-s);
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;

    svg {
      flex-shrink: 0;
      width: var(--ni-16);
      height: var(--ni-16);
    }

    &.is-added {
      border-color: var(--trakttime-accent);
      color: var(--trakttime-accent);
      background: color-mix(in srgb, var(--trakttime-accent) 10%, transparent);
    }

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }
</style>
