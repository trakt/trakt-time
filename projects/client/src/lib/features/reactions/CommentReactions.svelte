<script lang="ts">
  import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
  import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
  import * as m from '$lib/paraglide/messages.js';
  import type { Reaction } from '$lib/requests/queries/comments/commentReactionsQuery.ts';
  import ReactionIcon from './ReactionIcon.svelte';
  import { toReactionLabel } from './toReactionLabel.ts';
  import { useCommentReaction } from './useCommentReaction.ts';

  const { id }: { id: number } = $props();

  const REACTIONS: ReadonlyArray<Reaction> = [
    'like',
    'dislike',
    'love',
    'laugh',
    'shocked',
    'bravo',
    'spoiler',
  ];

  const { isAuthorized } = useAuth();
  const { currentReaction, summary, isReacting, react, remove } = $derived(
    useCommentReaction({ id }),
  );

  let isPickerOpen = $state(false);

  function toggle(reaction: Reaction) {
    isPickerOpen = false;
    if ($currentReaction === reaction) return remove();
    return react(reaction);
  }
</script>

<div class="comment-reactions">
  {#each $summary as { reaction, count } (reaction)}
    <button
      type="button"
      class="reaction-chip"
      class:is-current={$currentReaction === reaction}
      disabled={!$isAuthorized || $isReacting}
      aria-pressed={$currentReaction === reaction}
      aria-label={m.button_label_react({ reaction: toReactionLabel(reaction) })}
      onclick={() => toggle(reaction)}
    >
      <ReactionIcon {reaction} />
      {count}
    </button>
  {/each}

  {#if $isAuthorized}
    <button
      type="button"
      class="reaction-chip reaction-add"
      aria-expanded={isPickerOpen}
      aria-label={m.button_label_popup_reactions()}
      disabled={$isReacting}
      onclick={() => (isPickerOpen = !isPickerOpen)}
    >
      <PlusIcon />
    </button>
  {/if}

  {#if isPickerOpen}
    <div class="reaction-picker" role="group" aria-label={m.button_label_popup_reactions()}>
      {#each REACTIONS as reaction (reaction)}
        <button
          type="button"
          class="reaction-option"
          class:is-current={$currentReaction === reaction}
          aria-pressed={$currentReaction === reaction}
          aria-label={m.button_label_react({ reaction: toReactionLabel(reaction) })}
          onclick={() => toggle(reaction)}
        >
          <ReactionIcon {reaction} />
          <span class="reaction-option-label">{toReactionLabel(reaction)}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .comment-reactions {
    display: contents;
  }

  .reaction-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--gap-xxs);
    height: var(--ni-32);
    padding: 0 var(--gap-xs);
    border: none;
    border-radius: var(--trakttime-radius-pill);
    background: var(--color-floating-background);
    color: var(--color-text-primary);
    font: inherit;
    font-size: 0.75rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    :global(svg) {
      width: var(--ni-14);
      height: var(--ni-14);
    }

    &.is-current {
      background: color-mix(in srgb, var(--trakttime-accent) 22%, transparent);
      color: var(--color-text-emphasis);
    }

    &:disabled {
      cursor: default;
    }

    &:focus-visible {
      outline: var(--ni-2) solid var(--trakttime-accent);
      outline-offset: var(--ni-2);
    }
  }

  .reaction-add {
    width: var(--ni-32);
    justify-content: center;
    padding: 0;
    color: var(--color-text-secondary);
  }

  .reaction-picker {
    order: 1;
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: var(--gap-xxs);
    width: 100%;
    padding: var(--gap-xs);
    border-radius: var(--trakttime-radius-card);
    background: var(--color-card-background);
  }

  .reaction-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--ni-4);
    min-height: var(--ni-52);
    padding: var(--ni-4) 0;
    border: none;
    border-radius: var(--border-radius-m);
    background: transparent;
    color: var(--color-text-secondary);
    font: inherit;
    cursor: pointer;

    :global(svg) {
      width: var(--ni-22);
      height: var(--ni-22);
    }

    &.is-current {
      background: color-mix(in srgb, var(--trakttime-accent) 22%, transparent);
      color: var(--color-text-emphasis);
    }

    &:focus-visible {
      outline: var(--ni-2) solid var(--trakttime-accent);
      outline-offset: calc(var(--ni-2) * -1);
    }
  }

  .reaction-option-label {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.625rem;
    font-weight: 600;
  }
</style>
