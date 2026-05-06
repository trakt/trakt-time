<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import BackBar from '$lib/components/back-bar/BackBar.svelte';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import { userListsQuery } from '$lib/requests/queries/users/userListsQuery.ts';

  const listsQuery = $derived(useQuery(userListsQuery({})));
  const lists = $derived($listsQuery.data ?? []);
  const isLoading = $derived($listsQuery.isLoading);
</script>

<svelte:head>
  <title>{m.header_my_lists()} - Trakt Time</title>
</svelte:head>

<div class="all-lists-page">
  <BackBar href="/profile" label={m.header_my_lists()} />

  {#if isLoading && lists.length === 0}
    <div class="loading-state">
      <LoadingIndicator />
    </div>
  {:else if lists.length === 0}
    <div class="empty-state">
      <p>{m.text_no_lists()}</p>
    </div>
  {:else}
    <div class="lists-grid">
      {#each lists as list (list.id)}
        <a
          href="/lists/{list.id}?name={encodeURIComponent(list.name)}"
          class="list-card"
        >
          <span class="list-name">{list.name}</span>
          <span class="list-count">{list.count} {m.text_items_unit()}</span>
        </a>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .all-lists-page {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    padding-top: var(--ni-56);
    padding-bottom: var(--trakttime-bottom-nav-height);
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--gap-xxl) var(--gap-m);
    gap: var(--gap-m);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }

  .lists-grid {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    padding: 0 var(--gap-m);
  }

  .list-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--gap-s) var(--gap-m);
    background: var(--color-card-background);
    border-radius: var(--border-radius-m);
    border: var(--ni-1) solid var(--color-border);
    text-decoration: none;
    transition: border-color 0.15s ease;

    &:active {
      border-color: var(--trakttime-accent);
    }
  }

  .list-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .list-count {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }
</style>
