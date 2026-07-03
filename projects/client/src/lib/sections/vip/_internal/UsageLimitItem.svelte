<script lang="ts">
  import { languageTag } from '$lib/features/i18n/index.ts';
  import { toHumanNumber } from '$lib/utils/formatting/number/toHumanNumber.ts';
  import type { UsageCategoryItem } from './utils/mapToUsageCategories.ts';

  const { item }: { item: UsageCategoryItem } = $props();

  const progress = $derived(
    Math.min((item.limits.current / item.limits.vip) * 100, 100),
  );
  const isOverLimit = $derived(item.limits.current > item.limits.vip);
</script>

<div class="usage-limit-item">
  <div class="usage-limit-header">
    <span class="usage-limit-title">{item.title()}</span>
    <span class="usage-limit-values">
      {toHumanNumber(item.limits.current, languageTag())}
      <span class="usage-limit-max">
        / {toHumanNumber(item.limits.vip, languageTag())}
      </span>
    </span>
  </div>
  <div class="usage-limit-bar" class:is-over-limit={isOverLimit}>
    <div class="usage-limit-fill" style:width="{progress}%"></div>
  </div>
</div>

<style lang="scss">
  .usage-limit-item {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxs);
  }

  .usage-limit-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--gap-s);

    font-size: 0.875rem;
  }

  .usage-limit-values {
    font-weight: 600;
  }

  .usage-limit-max {
    color: var(--color-text-secondary);
    font-weight: 400;
  }

  .usage-limit-bar {
    height: var(--ni-8);
    border-radius: var(--border-radius-xxl);
    background: color-mix(in srgb, var(--color-text-secondary) 20%, transparent);
    overflow: hidden;

    &.is-over-limit .usage-limit-fill {
      background: var(--red-500);
    }
  }

  .usage-limit-fill {
    height: 100%;
    border-radius: inherit;
    background: var(--trakttime-accent);
  }
</style>
