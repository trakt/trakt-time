<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";

  type Props = {
    label: string;
    href?: string;
    onclick?: () => void;
  };

  const { label, href, onclick }: Props = $props();

  const handleFallback = () => history.back();
</script>

{#snippet content()}
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </svg>
  {label}
{/snippet}

<nav class="back-bar">
  {#if href}
    <a class="back-btn" {href} aria-label={m.button_label_back()}>
      {@render content()}
    </a>
  {:else}
    <button
      class="back-btn"
      onclick={onclick ?? handleFallback}
      aria-label={m.button_label_back()}
    >
      {@render content()}
    </button>
  {/if}
</nav>

<style lang="scss">
  .back-bar {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: var(--trakttime-max-width);
    z-index: var(--layer-floating);
    padding: var(--gap-s) var(--gap-m);
    pointer-events: none;
    margin-left: var(--gap-m);
  }

  .back-btn {
    pointer-events: auto;
    display: inline-flex;
    align-items: center;
    gap: var(--gap-xxs);
    padding: var(--ni-6) var(--ni-12) var(--ni-6) var(--ni-8);
    color: var(--color-text-primary);
    text-decoration: none;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 600;
    background: var(--trakttime-navbar-blur-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: var(--ni-1) solid var(--color-border);
    border-radius: 999px;

    svg {
      width: var(--ni-18);
      height: var(--ni-18);
    }
  }
</style>
