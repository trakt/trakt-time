<script lang="ts">
  import TrackIcon from '$lib/components/icons/TrackIcon.svelte';
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
  <button
    class="watched-pill"
    class:is-watched={$isWatched}
    onclick={toggleWatched}
    disabled={$isMarkingAsWatched}
    aria-label={$isWatched
      ? m.button_label_remove_from_watched({ title })
      : m.button_label_mark_as_watched({ title })}
    type="button"
  >
    <TrackIcon state={$isWatched ? 'watched' : 'unwatched'} />
    <span>{$isWatched ? m.tag_text_watched() : m.button_text_mark_as_watched()}</span>
  </button>
{/if}

<style lang="scss">
  .watched-pill {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--gap-xs);
    height: var(--ni-48);
    padding: 0 var(--gap-l);
    border-radius: var(--trakttime-radius-pill);
    border: var(--border-thickness-xs) solid var(--color-text-primary);
    background: none;
    color: var(--color-text-primary);
    font: inherit;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition:
      border-color var(--transition-increment) ease-in-out,
      background var(--transition-increment) ease-in-out,
      color var(--transition-increment) ease-in-out;

    :global(svg) {
      width: var(--ni-18);
      height: var(--ni-18);
    }

    &.is-watched {
      border-color: var(--trakttime-accent);
      background: var(--trakttime-accent);
      color: var(--trakttime-accent-foreground);
    }

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }
</style>
