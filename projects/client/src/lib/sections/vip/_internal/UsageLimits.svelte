<script lang="ts">
  import { useUser } from '$lib/features/auth/stores/useUser.ts';
  import UsageLimitItem from './UsageLimitItem.svelte';
  import { mapToUsageCategories } from './utils/mapToUsageCategories.ts';

  const { limits } = useUser();

  const categories = $derived(mapToUsageCategories($limits));
</script>

{#if $limits}
  <div class="usage-limits">
    {#each categories as category (category.title)}
      <div class="usage-limits-card">
        <h2 class="usage-limits-title">{category.title()}</h2>
        {#each category.items as item (item.title)}
          <UsageLimitItem {item} />
        {/each}
      </div>
    {/each}
  </div>
{/if}

<style lang="scss">
  .usage-limits {
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
  }

  .usage-limits-card {
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);

    padding: var(--gap-m);
    border-radius: var(--border-radius-l);
    background: var(--color-card-background);
    border: var(--ni-1) solid var(--color-border);
  }

  .usage-limits-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
  }
</style>
