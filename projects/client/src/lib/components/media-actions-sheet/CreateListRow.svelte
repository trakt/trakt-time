<script lang="ts">
  import LoaderIcon from '$lib/components/icons/LoaderIcon.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { useCreateList } from '$lib/sections/media-actions/list/useCreateList.ts';
  import { tick } from 'svelte';

  type Props = {
    onCreated?: (list: { id: number; slug: string }) => void;
  };
  const { onCreated }: Props = $props();

  const { createList, isCreating } = useCreateList();

  let mode = $state<'idle' | 'editing'>('idle');
  let name = $state('');
  let inputEl = $state<HTMLInputElement | null>(null);

  async function startEditing() {
    mode = 'editing';
    name = '';
    await tick();
    inputEl?.focus();
  }

  function cancel() {
    mode = 'idle';
    name = '';
  }

  async function submit() {
    if ($isCreating) return;
    const result = await createList(name);
    if (result) {
      onCreated?.(result);
      mode = 'idle';
      name = '';
    }
  }

  function onKeydown(ev: KeyboardEvent) {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      submit();
    } else if (ev.key === 'Escape') {
      ev.preventDefault();
      cancel();
    }
  }
</script>

{#if mode === 'idle'}
  <button
    type="button"
    class="create-row"
    onclick={startEditing}
    aria-label={m.button_label_create_list()}
  >
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
    <span>{m.button_text_new_list()}</span>
  </button>
{:else}
  <form class="create-form" onsubmit={(e) => e.preventDefault()}>
    <input
      bind:this={inputEl}
      bind:value={name}
      type="text"
      class="create-input"
      placeholder={m.placeholder_list_name()}
      maxlength="100"
      onkeydown={onKeydown}
      disabled={$isCreating}
      aria-label={m.placeholder_list_name()}
    />
    <button
      type="button"
      class="create-cancel"
      onclick={cancel}
      disabled={$isCreating}
      aria-label={m.button_text_cancel()}
    >
      {m.button_text_cancel()}
    </button>
    <button
      type="button"
      class="create-submit"
      onclick={submit}
      disabled={$isCreating || name.trim().length === 0}
      aria-label={m.button_text_create()}
    >
      {#if $isCreating}
        <LoaderIcon />
      {:else}
        {m.button_text_create()}
      {/if}
    </button>
  </form>
{/if}

<style lang="scss">
  .create-row,
  .create-form {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    width: 100%;
    min-height: var(--ni-56);
    padding: var(--gap-xs) var(--gap-m);
    box-sizing: border-box;
  }

  .create-row {
    border: none;
    background: none;
    color: var(--trakttime-accent);
    font: inherit;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background var(--transition-increment) ease-in-out;

    svg {
      flex-shrink: 0;
      width: var(--ni-20);
      height: var(--ni-20);
    }

    &:hover,
    &:focus-visible {
      background: color-mix(in srgb, var(--trakttime-accent) 8%, transparent);
    }
  }

  .create-input {
    flex: 1;
    min-width: 0;
    height: var(--ni-40);
    padding: 0 var(--gap-s);
    border: var(--border-thickness-xs) solid var(--trakttime-accent);
    border-radius: var(--trakttime-radius-pill);
    outline: none;
    background: var(--color-card-background);
    color: var(--color-text-primary);
    font: inherit;
    font-size: 0.9375rem;

    &::placeholder {
      color: var(--color-text-secondary);
    }

    &:disabled {
      opacity: 0.6;
    }
  }

  .create-cancel,
  .create-submit {
    flex-shrink: 0;
    height: var(--ni-40);
    border: none;
    border-radius: var(--trakttime-radius-pill);
    padding: 0 var(--gap-s);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition:
      background var(--transition-increment) ease-in-out,
      color var(--transition-increment) ease-in-out;

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }

  .create-cancel {
    background: none;
    color: var(--color-text-secondary);

    &:hover:not(:disabled) {
      color: var(--color-text-primary);
    }
  }

  .create-submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--ni-72);
    background: var(--trakttime-accent);
    color: var(--trakttime-accent-foreground);

    :global(svg) {
      width: var(--ni-14);
      height: var(--ni-14);
      animation: spin 1s linear infinite;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(1turn);
    }
  }
</style>
