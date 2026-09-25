<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import type { GifEntry } from '$lib/requests/models/GifEntry.ts';
  import { useDebouncedValue } from '$lib/stores/useDebouncedValue.ts';
  import { GIF_SEARCH_DEBOUNCE } from './_internal/constants.ts';
  import GifResults from './_internal/GifResults.svelte';
  import { klipyCustomerId } from './klipyCustomerId.ts';

  type Props = {
    onClose: () => void;
    onSelect: (gif: GifEntry) => void;
    suggestedQuery?: string;
  };

  const { onClose, onSelect, suggestedQuery }: Props = $props();

  const customerId = klipyCustomerId();

  let searchTerm = $state('');
  let inputEl: HTMLInputElement | undefined = $state();

  const debouncedTerm = useDebouncedValue<string>(GIF_SEARCH_DEBOUNCE);
  $effect(() => {
    debouncedTerm.set(searchTerm.trim());
  });

  const query = $derived($debouncedTerm || suggestedQuery || '');

  $effect(() => {
    inputEl?.focus();
  });

  function select(gif: GifEntry) {
    onSelect(gif);
    onClose();
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;

    event.stopPropagation();
    onClose();
  }
</script>

<div
  class="gif-picker"
  role="dialog"
  aria-modal="true"
  aria-label={m.button_label_add_gif()}
  tabindex="-1"
  onkeydown={onKeydown}
>
  <header class="gif-picker-header">
    <input
      bind:this={inputEl}
      bind:value={searchTerm}
      type="search"
      class="gif-search"
      placeholder={m.input_placeholder_search_gifs()}
      aria-label={m.input_placeholder_search_gifs()}
      enterkeyhint="search"
    />
    <button type="button" class="gif-cancel" onclick={onClose}>
      {m.button_text_cancel()}
    </button>
  </header>

  <div class="gif-picker-body">
    {#key query}
      <GifResults {customerId} {query} onSelect={select} />
    {/key}
  </div>
</div>

<style lang="scss">
  .gif-picker {
    position: fixed;
    inset: 0;
    z-index: var(--layer-top);
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
    max-width: var(--trakttime-max-width);
    margin: 0 auto;
    padding: calc(var(--gap-s) + env(safe-area-inset-top, 0px)) var(--gap-m) 0;
    box-sizing: border-box;
    background: var(--color-background);
    animation: gif-picker-in 0.22s cubic-bezier(0.32, 0.72, 0, 1);
  }

  .gif-picker-header {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
  }

  .gif-search {
    flex: 1;
    min-width: 0;
    height: var(--ni-44);
    padding: 0 var(--gap-m);
    box-sizing: border-box;
    border: var(--ni-1) solid transparent;
    border-radius: var(--trakttime-radius-pill);
    background: var(--color-card-background);
    color: var(--color-text-primary);
    font: inherit;
    font-size: 1rem;
    caret-color: var(--trakttime-accent);

    &:focus {
      outline: none;
      border-color: color-mix(in srgb, var(--trakttime-accent) 50%, transparent);
    }
  }

  .gif-cancel {
    flex-shrink: 0;
    padding: var(--gap-xs) 0;
    border: none;
    background: none;
    color: var(--color-text-primary);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .gif-picker-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding-bottom: calc(var(--gap-m) + env(safe-area-inset-bottom, 0px));
  }

  @keyframes gif-picker-in {
    from {
      transform: translateY(var(--gap-l));
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .gif-picker {
      animation: none;
    }
  }
</style>
