<script lang="ts" generics="T extends string">
  import * as m from '$lib/paraglide/messages.js';
  import ReactionEmoji from './ReactionEmoji.svelte';
  import type { ReactionDetailsProps } from './ReactionDetailsProps.ts';

  const {
    reaction,
    code,
    label,
    value,
    isCurrent,
    onRemove,
    onAdd,
  }: ReactionDetailsProps<T> = $props();

  const onPress = $derived(isCurrent ? onRemove : onAdd);
  const pressLabel = $derived(
    isCurrent
      ? m.button_label_remove_reaction({ reaction: label })
      : m.button_label_react({ reaction: label }),
  );
</script>

{#snippet content()}
  <ReactionEmoji {code} {label} />
  <span class="reaction-value">{value}</span>
{/snippet}

{#if onPress}
  <button
    type="button"
    class="reaction-details is-pressable"
    class:is-current={isCurrent}
    aria-label={pressLabel}
    onclick={() => onPress(reaction)}
  >
    {@render content()}
  </button>
{:else}
  <div class="reaction-details" class:is-current={isCurrent}>
    {@render content()}
  </div>
{/if}

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .reaction-details {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
    min-width: var(--ni-64);
    height: var(--ni-30);
    box-sizing: border-box;
    padding: var(--ni-2) var(--ni-8);
    border-radius: var(--trakttime-radius-pill);
    color: var(--color-text-primary);
    cursor: default;
    transition: background-color var(--transition-increment) ease-in-out;

    --reaction-emoji-size: var(--ni-18);

    &.is-current {
      background: var(--color-current-reaction-background);
    }
  }

  .reaction-value {
    font-size: 0.75rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .is-pressable {
    border: none;
    font: inherit;
    background: transparent;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    &.is-current {
      background: var(--color-current-reaction-background);
    }

    @include for-mouse {
      &:hover {
        background: var(--color-reaction-background-hover);
      }
    }

    &:focus-visible {
      outline: var(--border-thickness-xs) solid var(--trakttime-accent);
      outline-offset: var(--ni-2);
    }
  }
</style>
