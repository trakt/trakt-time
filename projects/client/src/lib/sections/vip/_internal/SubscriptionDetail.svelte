<script lang="ts">
  import type { Snippet } from 'svelte';

  const {
    children,
    icon,
    title,
  }: { icon: Snippet; title: string } & ChildrenProps = $props();
</script>

<div class="subscription-detail">
  <div class="subscription-detail-icon">
    {@render icon()}
  </div>

  <div class="subscription-detail-body">
    <span class="subscription-detail-title">{title}</span>
    <span class="subscription-detail-value">{@render children()}</span>
  </div>
</div>

<style lang="scss">
  .subscription-detail {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
  }

  .subscription-detail-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    width: var(--ni-36);
    height: var(--ni-36);

    background: color-mix(in srgb, var(--color-text-primary) 5%, transparent);
    border: var(--ni-1) solid
      color-mix(in srgb, var(--color-text-primary) 10%, transparent);
    border-radius: var(--border-radius-m);

    :global(svg) {
      width: var(--trakttime-icon-md);
      height: var(--trakttime-icon-md);
      color: var(--color-text-secondary);
    }
  }

  .subscription-detail-body {
    display: flex;
    flex-direction: column;
    gap: var(--ni-2);
    min-width: 0;
  }

  .subscription-detail-title {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .subscription-detail-value {
    font-weight: 600;
  }
</style>
