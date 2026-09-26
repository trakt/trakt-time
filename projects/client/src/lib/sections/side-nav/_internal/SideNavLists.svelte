<script lang="ts">
  import { page } from '$app/state';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import * as m from '$lib/paraglide/messages.js';
  import { userListsQuery } from '$lib/requests/queries/users/userListsQuery.ts';

  const LISTS_LIMIT = 6;

  const listsQuery = useQuery(userListsQuery());
  const lists = $derived(($listsQuery.data ?? []).slice(0, LISTS_LIMIT));
</script>

{#if lists.length > 0}
  <section class="side-nav-lists">
    <h2 class="side-nav-lists-title">{m.header_my_lists()}</h2>
    {#each lists as list (list.id)}
      <a
        href="/lists/{list.id}?name={encodeURIComponent(list.name)}"
        class="side-nav-list"
        data-active={page.url.pathname === `/lists/${list.id}`}
      >
        {list.name}
      </a>
    {/each}
  </section>
{/if}

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .side-nav-lists {
    display: flex;
    flex-direction: column;
    gap: var(--ni-2);
    min-height: 0;
    overflow-y: auto;
  }

  .side-nav-lists-title {
    margin: 0 0 var(--gap-xxs);
    padding: 0 var(--gap-s);
    font-family: var(--trakttime-font-body);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .side-nav-list {
    padding: var(--ni-6) var(--gap-s);
    border-radius: var(--border-radius-s);
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &[data-active='true'] {
      color: var(--color-text-primary);
      background: var(--color-card-background);
    }

    @include for-mouse {
      &:hover {
        color: var(--color-text-primary);
      }
    }
  }
</style>
