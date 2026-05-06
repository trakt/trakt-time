<script lang="ts">
  import MarkAsWatchedIcon from '$lib/components/icons/MarkAsWatchedIcon.svelte';
  import type { MarkAsWatchedStoreProps } from '$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts';
  import { useMarkAsWatched } from '$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts';
  import * as m from '$lib/paraglide/messages.js';

  type Props = { watchedProps: MarkAsWatchedStoreProps; title: string };
  const { watchedProps, title }: Props = $props();

  const { markAsWatched, removeWatched, isWatched, isMarkingAsWatched, isWatchable } =
    $derived(useMarkAsWatched(watchedProps));

  function toggleWatched() {
    if ($isWatched) removeWatched();
    else markAsWatched();
  }
</script>

{#if isWatchable}
  <div class="watched-row">
    <span class="watched-label" class:is-watched={$isWatched}>
      {$isWatched ? m.tag_text_watched() : m.button_text_mark_as_watched()}
    </span>
    <button
      class="watched-btn"
      class:is-watched={$isWatched}
      onclick={toggleWatched}
      disabled={$isMarkingAsWatched}
      aria-label={$isWatched
        ? m.button_label_remove_from_watched({ title })
        : m.button_label_mark_as_watched({ title })}
      type="button"
    >
      <MarkAsWatchedIcon state={$isWatched ? 'watched' : 'unwatched'} />
    </button>
  </div>
{/if}

<style lang="scss">
  .watched-row {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    margin-top: var(--gap-xxs);
  }

  .watched-label {
    font-size: 0.75rem;
    color: var(--color-text-secondary);

    &.is-watched {
      color: var(--trakttime-accent);
    }
  }

  .watched-btn {
    background: none;
    border: var(--ni-2) solid var(--color-border);
    border-radius: 50%;
    width: var(--ni-28);
    height: var(--ni-28);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 0;
    transition:
      border-color var(--transition-increment) ease-in-out,
      color var(--transition-increment) ease-in-out,
      background var(--transition-increment) ease-in-out;

    :global(svg) {
      width: var(--ni-14);
      height: var(--ni-14);
    }

    &.is-watched {
      border-color: var(--trakttime-accent);
      background: var(--trakttime-accent);
      color: var(--color-background);
    }

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }
</style>
