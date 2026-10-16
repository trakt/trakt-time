<script lang="ts" generics="T extends string">
  import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import ReactionPickerCell from './ReactionPickerCell.svelte';
  import type { ReactionPickerProps } from './ReactionPickerProps.ts';

  const {
    options,
    chosen,
    onSelect,
    quickCount,
    limit,
    isExpanded = false,
    onToggleExpanded,
  }: ReactionPickerProps<T> = $props();

  const quick = $derived(options.slice(0, quickCount));
  const rest = $derived(options.slice(quickCount));
</script>

<div
  class="reaction-picker"
  class:is-expanded={isExpanded}
  style:--picker-columns={quick.length + 1}
>
  <div class="picker-more" inert={!isExpanded}>
    <div class="picker-more-body">
      <div class="picker-more-card">
        <div class="picker-grid is-scrolling">
          {#each rest as option, index (option.id)}
            <ReactionPickerCell {option} {index} {chosen} {limit} {onSelect} />
          {/each}
        </div>
      </div>
    </div>
  </div>

  <div class="picker-quick">
    <div class="picker-grid">
      {#each quick as option, index (option.id)}
        <ReactionPickerCell {option} {index} {chosen} {limit} {onSelect} />
      {/each}

      <button
        type="button"
        class="picker-toggle"
        aria-expanded={isExpanded}
        aria-label={isExpanded
          ? m.button_label_quick_reactions()
          : m.button_label_more_reactions()}
        onclick={onToggleExpanded}
      >
        <span class="picker-toggle-icon" class:is-open={isExpanded}>
          <PlusIcon />
        </span>
      </button>
    </div>
  </div>
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .reaction-picker {
    display: flex;
    flex-direction: var(--reaction-picker-direction, column);
    padding: var(--ni-8) var(--ni-10);
  }

  .picker-quick {
    height: var(--ni-40);
  }

  .picker-grid {
    display: grid;
    grid-template-columns: repeat(var(--picker-columns), var(--ni-40));
    justify-content: space-between;
    align-items: center;
    row-gap: var(--gap-xxs);

    &.is-scrolling {
      height: var(--ni-216);
      align-content: start;
      overflow-y: auto;
      padding-block-end: var(--ni-8);
      scrollbar-width: none;
      mask-image: linear-gradient(
        to bottom,
        black calc(100% - var(--ni-16)),
        transparent
      );

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }

  .picker-more {
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;

    transition:
      grid-template-rows calc(var(--transition-increment) * 2)
        cubic-bezier(0.22, 1, 0.36, 1),
      opacity var(--transition-increment) ease-out;

    .is-expanded & {
      grid-template-rows: 1fr;
      opacity: 1;
    }
  }

  .picker-more-body {
    min-height: 0;
    overflow: hidden;
    margin-inline: calc(-1 * var(--ni-4));
  }

  .picker-more-card {
    margin-block: 0 var(--ni-12);
    padding: var(--ni-8) var(--ni-4) 0;
    background: var(--color-reaction-distribution-background);
    border-radius: var(--trakttime-radius-card);

    :global([data-placement='bottom']) & {
      margin-block: var(--ni-12) 0;
    }
  }

  .picker-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--ni-40);
    height: var(--ni-40);
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background-color var(--transition-increment) ease-in-out;

    @include for-mouse {
      &:hover {
        background: var(--color-reaction-background-hover);
      }
    }

    &:focus-visible {
      outline: var(--border-thickness-xs) solid var(--trakttime-accent);
      outline-offset: calc(var(--ni-2) * -1);
    }

    :global(svg) {
      width: var(--ni-16);
      height: var(--ni-16);
    }
  }

  .picker-toggle-icon {
    display: flex;
    transition: transform calc(var(--transition-increment) * 2)
      cubic-bezier(0.22, 1, 0.36, 1);

    &.is-open {
      transform: rotate(45deg);
    }
  }
</style>
