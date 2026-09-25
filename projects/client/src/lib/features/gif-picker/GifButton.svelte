<script lang="ts">
  import GifIcon from '$lib/components/icons/GifIcon.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { GifEntry } from '$lib/requests/models/GifEntry.ts';
  import GifPicker from './GifPicker.svelte';
  import { isGifPickerAvailable } from './isGifPickerAvailable.ts';

  type Props = {
    onSelect: (gif: GifEntry) => void;
    disabled?: boolean;
    suggestedQuery?: string;
  };

  const { onSelect, disabled, suggestedQuery }: Props = $props();

  let isPickerOpen = $state(false);
</script>

{#if isGifPickerAvailable()}
  <button
    type="button"
    class="gif-button"
    aria-label={m.button_label_add_gif()}
    {disabled}
    onclick={() => (isPickerOpen = true)}
  >
    <GifIcon />
  </button>

  {#if isPickerOpen}
    <GifPicker
      {onSelect}
      {suggestedQuery}
      onClose={() => (isPickerOpen = false)}
    />
  {/if}
{/if}

<style lang="scss">
  .gif-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ni-40);
    height: var(--ni-40);
    padding: 0;
    border: none;
    border-radius: var(--border-radius-m);
    background: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    &:hover:not(:disabled),
    &:focus-visible {
      color: var(--trakttime-accent);
      background: color-mix(in srgb, var(--trakttime-accent) 10%, transparent);
    }

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }

    :global(svg) {
      width: var(--ni-28);
      height: var(--ni-28);
    }
  }
</style>
