<script lang="ts" generics="T extends string">
  import type { Snippet } from 'svelte';

  type Option = {
    value: T;
    label: string;
    icon?: Snippet;
  };

  type Props = {
    label: string;
    value: T;
    options: ReadonlyArray<Option>;
    onChange: (value: T) => void;
    surface?: 'background' | 'card';
  };

  const { label, value, options, onChange, surface = 'background' }: Props =
    $props();
</script>

<div
  class="segmented-control"
  role="group"
  aria-label={label}
  data-surface={surface}
>
  {#each options as option (option.value)}
    <button
      type="button"
      class="segmented-option"
      class:is-icon={Boolean(option.icon)}
      aria-pressed={option.value === value}
      aria-label={option.icon ? option.label : undefined}
      title={option.icon ? option.label : undefined}
      onclick={() => onChange(option.value)}
    >
      {#if option.icon}
        {@render option.icon()}
      {:else}
        {option.label}
      {/if}
    </button>
  {/each}
</div>

<style lang="scss">
  .segmented-control {
    display: inline-flex;
    gap: var(--ni-2);
    padding: var(--ni-4);
    border-radius: var(--trakttime-radius-pill);
    background: var(--color-card-background);

    &[data-surface='card'] {
      background: var(--color-background);
    }
  }

  .segmented-option {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: var(--ni-32);
    padding: 0 var(--gap-s);
    border: none;
    border-radius: var(--trakttime-radius-pill);
    background: transparent;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition:
      background-color var(--transition-increment) ease-in-out,
      color var(--transition-increment) ease-in-out;

    &.is-icon {
      width: var(--ni-40);
      padding: 0;

      :global(svg) {
        width: var(--ni-18);
        height: var(--ni-18);
      }
    }

    &[aria-pressed='true'] {
      background: var(--color-floating-background);
      color: var(--color-text-primary);
      box-shadow: 0 var(--ni-1) var(--ni-2) color-mix(in srgb, var(--color-shadow) 40%, transparent);
    }

    &:focus-visible {
      outline: var(--ni-2) solid var(--trakttime-accent);
      outline-offset: var(--ni-2);
    }
  }
</style>
