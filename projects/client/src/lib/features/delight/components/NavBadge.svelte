<script lang="ts">
  import { clearNavBadge, navBadge } from "../navBadges.ts";

  const { href, isActive }: { href: string; isActive: boolean } = $props();

  const count = $derived(navBadge(href));

  $effect(() => {
    if (isActive) clearNavBadge(href);
  });
</script>

{#if $count > 0}
  <span class="trakt-nav-badge" aria-hidden="true">+{$count}</span>
{/if}

<style>
  .trakt-nav-badge {
    position: absolute;
    top: var(--ni-2);
    inset-inline-end: 22%;
    min-width: var(--ni-18);
    height: var(--ni-18);
    padding: 0 var(--ni-4);
    border-radius: var(--trakttime-radius-pill);
    background: var(--rose-500);
    color: var(--shade-10);
    font-size: 0.625rem;
    font-weight: 700;
    line-height: var(--ni-18);
    text-align: center;
    font-variant-numeric: tabular-nums;
    animation: nav-badge-pop 320ms cubic-bezier(0.3, 1.4, 0.5, 1) both;
  }

  @keyframes nav-badge-pop {
    from {
      transform: scale(0.4);
    }
    to {
      transform: scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .trakt-nav-badge {
      animation: none;
    }
  }
</style>
