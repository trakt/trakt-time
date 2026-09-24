<script lang="ts">
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import { tick } from 'svelte';
  import { shouldAutoLoad } from './shouldAutoLoad.ts';

  type Props = {
    hasMore: boolean;
    isLoading: boolean;
    count: number;
    onload: () => unknown;
    isEnabled?: boolean;
  };

  const { hasMore, isLoading, count, onload, isEnabled = true }: Props =
    $props();

  const PRELOAD_DISTANCE = '800px 0px';

  let isNear = $state(false);
  let isRequesting = $state(false);
  let stalledAtCount = $state<number | null>(null);

  function observeNearness(node: HTMLElement) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isNear = entry?.isIntersecting ?? false;
        if (!isNear) stalledAtCount = null;
      },
      { rootMargin: PRELOAD_DISTANCE },
    );
    observer.observe(node);

    return { destroy: () => observer.disconnect() };
  }

  async function load() {
    const countBefore = count;
    isRequesting = true;

    try {
      await onload();
      await tick();
    } finally {
      stalledAtCount = count === countBefore ? count : null;
      isRequesting = false;
    }
  }

  $effect(() => {
    if (
      isRequesting ||
      !shouldAutoLoad({
        isEnabled,
        isNear,
        hasMore,
        isLoading,
        count,
        stalledAtCount,
      })
    ) {
      return;
    }

    load();
  });
</script>

{#if hasMore}
  <div class="infinite-scroll-trigger" use:observeNearness>
    {#if isLoading}
      <LoadingIndicator />
    {/if}
  </div>
{/if}

<style lang="scss">
  .infinite-scroll-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: var(--ni-48);
  }
</style>
