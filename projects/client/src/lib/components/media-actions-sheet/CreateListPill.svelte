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
    class="create-pill"
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
  .create-pill {
    display: inline-flex;
    align-items: center;
    gap: var(--gap-xs);
    background: none;
    border: 1.5px dashed
      color-mix(in srgb, var(--trakttime-accent) 50%, transparent);
    border-radius: var(--border-radius-m);
    padding: var(--gap-xs) var(--gap-s);
    color: var(--trakttime-accent);
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s ease, border-color 0.15s ease;
    -webkit-tap-highlight-color: transparent;

    svg {
      flex-shrink: 0;
      width: var(--ni-16);
      height: var(--ni-16);
    }

    &:hover,
    &:focus-visible {
      background: color-mix(in srgb, var(--trakttime-accent) 8%, transparent);
      border-color: var(--trakttime-accent);
    }
  }

  .create-form {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
    width: 100%;
    background: var(--color-card-background);
    border: 1.5px solid var(--trakttime-accent);
    border-radius: var(--border-radius-m);
    padding: var(--gap-xxs) var(--gap-xs) var(--gap-xxs) var(--gap-s);
  }

  .create-input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: var(--color-text-primary);
    font-size: 0.875rem;

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
    background: none;
    border: none;
    border-radius: var(--border-radius-s);
    padding: var(--gap-xxs) var(--gap-s);
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.15s ease, color 0.15s ease;

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }

  .create-cancel {
    color: var(--color-text-secondary);

    &:hover:not(:disabled) {
      color: var(--color-text-primary);
    }
  }

  .create-submit {
    background: var(--trakttime-accent);
    color: var(--color-background);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 4rem;

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
