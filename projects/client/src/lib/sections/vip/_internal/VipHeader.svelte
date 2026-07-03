<script lang="ts">
  import VipBadge from '$lib/components/badge/VipBadge.svelte';
  import CrownIcon from './icons/CrownIcon.svelte';

  const { title, tagline }: { title: string; tagline: string } = $props();
</script>

<header class="vip-header">
  <div class="vip-header-crown">
    <CrownIcon />
  </div>
  <h1 class="vip-header-title">
    {title}
    <VipBadge />
  </h1>
  <p class="vip-header-tagline">{tagline}</p>
</header>

<style lang="scss">
  .vip-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-s);

    text-align: center;
  }

  .vip-header-crown {
    display: flex;
    align-items: center;
    justify-content: center;

    width: var(--ni-48);
    height: var(--ni-48);

    color: var(--color-background-vip-badge);

    :global(svg) {
      width: 100%;
      height: 100%;
    }
  }

  .vip-header-title {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);

    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .vip-header-tagline {
    margin: 0;
    max-width: 32ch;

    color: var(--color-text-secondary);
    font-size: 0.9375rem;
    line-height: 1.5;
  }
</style>
