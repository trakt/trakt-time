<script lang="ts">
  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { Snippet } from 'svelte';

  type Props = {
    title: string;
    subtitle?: string;
    onClose: () => void;
    children: Snippet;
  };

  const { title, subtitle, onClose, children }: Props = $props();

  function onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) onClose();
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') onClose();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="bottom-sheet-backdrop"
  onclick={onBackdropClick}
  onkeydown={onKeydown}
  role="dialog"
  aria-modal="true"
  aria-label={title}
  tabindex="-1"
>
  <div class="bottom-sheet sheet">
    <div class="bottom-sheet-handle"></div>
    <header class="sheet-header">
      <div class="sheet-heading">
        <p class="sheet-title">{title}</p>
        {#if subtitle}
          <p class="sheet-subtitle">{subtitle}</p>
        {/if}
      </div>
      <button
        type="button"
        class="sheet-close"
        onclick={onClose}
        aria-label={m.button_text_done()}
      >
        <CloseIcon />
      </button>
    </header>
    {@render children()}
  </div>
</div>

<style lang="scss">
  .sheet {
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
    padding-top: var(--gap-s);
    padding-inline: var(--gap-m);
    text-align: start;
  }

  .sheet-header {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
  }

  .sheet-heading {
    flex: 1;
    min-width: 0;
  }

  .sheet-title {
    margin: 0;
    font-family: var(--trakttime-font-heading);
    font-size: 1.375rem;
    font-weight: 600;
    color: var(--color-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sheet-subtitle {
    margin: var(--ni-2) 0 0;
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .sheet-close {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ni-32);
    height: var(--ni-32);
    border: none;
    border-radius: 50%;
    background: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
    color: var(--color-text-secondary);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    :global(svg) {
      width: var(--ni-16);
      height: var(--ni-16);
    }

    &:hover,
    &:focus-visible {
      background: color-mix(in srgb, var(--color-text-primary) 12%, transparent);
      color: var(--color-text-primary);
    }
  }
</style>
