<script lang="ts">
  import { userListItemsQuery } from '$lib/requests/queries/users/userListItemsQuery.ts';
  import { usePaginatedListQuery } from '$lib/sections/lists/stores/usePaginatedListQuery.ts';
  import { toListItemPoster } from './toListItemPoster.ts';

  type Props = {
    userId: string;
    listId: number;
  };

  const { userId, listId }: Props = $props();

  const STACK_SIZE = 3;

  const { list } = $derived(
    usePaginatedListQuery(
      userListItemsQuery({ userId, listId: String(listId), limit: STACK_SIZE }),
    ),
  );

  const posters = $derived($list.slice(0, STACK_SIZE).map(toListItemPoster));
</script>

<div class="list-poster-stack" aria-hidden="true">
  {#each Array(STACK_SIZE) as _, i (i)}
    {#if posters[i]}
      <img src={posters[i]} alt="" loading="lazy" />
    {:else}
      <span class="list-poster-placeholder"></span>
    {/if}
  {/each}
</div>

<style lang="scss">
  .list-poster-stack {
    position: relative;
    flex-shrink: 0;
    width: var(--ni-48);
    height: var(--ni-48);

    img,
    .list-poster-placeholder {
      position: absolute;
      top: var(--ni-2);
      width: var(--ni-28);
      aspect-ratio: 2 / 3;
      object-fit: cover;
      border-radius: var(--border-radius-xs);
      border: var(--ni-2) solid var(--color-card-background);
      background: var(--color-floating-background);
    }

    > :nth-child(1) {
      inset-inline-start: 0;
      transform: rotate(-9deg);
    }

    > :nth-child(2) {
      inset-inline-start: var(--ni-10);
      z-index: 1;
    }

    > :nth-child(3) {
      inset-inline-start: var(--ni-20);
      transform: rotate(9deg);
      z-index: 2;
    }
  }
</style>
