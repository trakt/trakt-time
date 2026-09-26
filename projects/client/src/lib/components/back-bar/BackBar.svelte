<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import type { Snippet } from "svelte";

  type Props = {
    label: string;
    href?: string;
    onclick?: () => void;
    variant?: "header" | "overlay";
    action?: Snippet;
  };

  const { label, href, onclick, variant = "header", action }: Props = $props();

  const handleFallback = () => history.back();
</script>

{#snippet icon()}
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
{/snippet}

<nav class="back-bar" data-variant={variant}>
  {#if href}
    <a class="back-btn icon-button-round" {href} aria-label={m.button_label_back()}>
      {@render icon()}
    </a>
  {:else}
    <button
      class="back-btn icon-button-round"
      onclick={onclick ?? handleFallback}
      aria-label={m.button_label_back()}
    >
      {@render icon()}
    </button>
  {/if}

  {#if variant === "header"}
    <h1 class="back-bar-title">{label}</h1>
  {/if}

  {#if action}
    <div class="back-bar-action">
      {@render action()}
    </div>
  {/if}
</nav>

<style lang="scss">
  .back-bar {
    position: fixed;
    top: 0;
    left: var(--trakttime-column-center);
    transform: translateX(-50%);
    width: 100%;
    max-width: var(--trakttime-max-width);
    z-index: var(--layer-floating);
    display: grid;
    grid-template-columns: var(--ni-44) 1fr var(--ni-44);
    align-items: center;
    gap: var(--gap-s);
    padding: calc(var(--gap-s) + env(safe-area-inset-top, 0px)) var(--gap-m)
      var(--gap-s);
    box-sizing: border-box;
    pointer-events: none;

    &[data-variant="header"] {
      background: linear-gradient(
        var(--color-background) 65%,
        transparent
      );
    }
  }

  .back-btn {
    pointer-events: auto;
    border: none;
    cursor: pointer;
    text-decoration: none;

    svg {
      width: var(--ni-24);
      height: var(--ni-24);
    }
  }

  .back-bar-action {
    grid-column: 3;
    justify-self: end;
    pointer-events: auto;
  }

  .back-bar-title {
    font-size: 1.0625rem;
    font-weight: 600;
    text-align: center;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
