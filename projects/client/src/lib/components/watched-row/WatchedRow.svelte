<script lang="ts">
  import TrackIcon from '$lib/components/icons/TrackIcon.svelte';
  import { celebrate } from '$lib/features/delight/celebrate.ts';
  import { isCaughtUp } from '$lib/features/delight/caughtUp.ts';
  import Sparkles from '$lib/features/delight/effects/Sparkles.svelte';
  import { of } from 'rxjs';
  import type { MarkAsWatchedStoreProps } from '$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts';
  import { useMarkAsWatched } from '$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts';
  import * as m from '$lib/paraglide/messages.js';

  type Props = { watchedProps: MarkAsWatchedStoreProps; title: string };
  const { watchedProps, title }: Props = $props();

  const { markAsWatched, removeWatched, isWatched, isMarkingAsWatched, isWatchable } =
    $derived(useMarkAsWatched(watchedProps));

  const caughtUpShow = $derived(
    watchedProps.type === 'show' && !Array.isArray(watchedProps.media)
      ? isCaughtUp(watchedProps.media.id)
      : of(false),
  );
  const isShowingCaughtUp = $derived($caughtUpShow && $isWatched);
  const SPARKLE_DELAY = 700;

  let pill: HTMLButtonElement | null = $state(null);

  $effect(() => {
    if (!isShowingCaughtUp || !pill) return;

    const target = pill;
    const timer = setTimeout(
      () => celebrate({ effect: Sparkles, at: target }),
      SPARKLE_DELAY,
    );
    return () => clearTimeout(timer);
  });

  function toggleWatched() {
    if ($isWatched) removeWatched();
    else markAsWatched();
  }
</script>

{#if isWatchable}
  <button
    class="watched-pill"
    class:is-watched={$isWatched}
    class:is-caught-up={isShowingCaughtUp}
    bind:this={pill}
    onclick={toggleWatched}
    disabled={$isMarkingAsWatched}
    aria-label={$isWatched
      ? m.button_label_remove_from_watched({ title })
      : m.button_label_mark_as_watched({ title })}
    type="button"
  >
    <TrackIcon state={$isWatched ? 'watched' : 'unwatched'} />
    <span>
      {#if isShowingCaughtUp}
        {m.delight_all_caught_up()}
      {:else}
        {$isWatched ? m.tag_text_watched() : m.button_text_mark_as_watched()}
      {/if}
    </span>
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
      border-color: transparent;
      background: var(--trakttime-gradient);
      color: var(--trakttime-accent-foreground);
    }

    &.is-caught-up {
      border-color: transparent;
      background: var(--green-600);
      color: var(--shade-10);
    }

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }
</style>
