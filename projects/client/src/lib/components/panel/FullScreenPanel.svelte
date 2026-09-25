<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import type { Snippet } from 'svelte';

  type Props = {
    title: string;
    onClose: () => void;
    footer?: Snippet;
  } & ChildrenProps;

  const { title, onClose, footer, children }: Props = $props();

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;

    event.stopPropagation();
    onClose();
  }
</script>

<div
  class="full-screen-panel"
  role="dialog"
  aria-modal="true"
  aria-label={title}
  tabindex="-1"
  onkeydown={onKeydown}
>
  <header class="panel-header">
    <button
      type="button"
      class="panel-back icon-button-round"
      aria-label={m.button_label_back()}
      onclick={onClose}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
      </svg>
    </button>
    <h2 class="panel-title">{title}</h2>
  </header>

  <div class="panel-body">
    {@render children()}
  </div>

  {#if footer}
    {@render footer()}
  {/if}
</div>

<style lang="scss">
  .full-screen-panel {
    position: fixed;
    inset: 0;
    z-index: var(--layer-menu);
    display: flex;
    flex-direction: column;
    max-width: var(--trakttime-max-width);
    margin: 0 auto;
    box-sizing: border-box;
    padding-top: env(safe-area-inset-top, 0px);
    background: var(--color-background);
    animation: panel-in 0.28s cubic-bezier(0.32, 0.72, 0, 1);

    &:focus {
      outline: none;
    }
  }

  .panel-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    padding: var(--gap-s) var(--gap-m);
  }

  .panel-back {
    flex-shrink: 0;
    border: none;
    cursor: pointer;

    svg {
      width: var(--ni-24);
      height: var(--ni-24);
    }
  }

  .panel-title {
    flex: 1;
    min-width: 0;
    margin: 0;
    font-family: var(--trakttime-font-heading);
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--color-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .panel-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 0 var(--gap-m) calc(var(--gap-xl) + env(safe-area-inset-bottom, 0px));
  }

  @keyframes panel-in {
    from {
      transform: translateX(var(--gap-xl));
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .full-screen-panel {
      animation: none;
    }
  }
</style>
