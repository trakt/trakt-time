<script lang="ts">
  import TrackIcon from '$lib/components/icons/TrackIcon.svelte';
  import { celebrate } from '$lib/features/delight/celebrate.ts';
  import { isCaughtUp } from '$lib/features/delight/caughtUp.ts';
  import Sparkles from '$lib/features/delight/effects/Sparkles.svelte';
  import { of } from 'rxjs';
  import type { MarkAsWatchedStoreProps } from '$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts';
  import { useMarkAsWatched } from '$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts';
  import { useWatchProgress } from '$lib/sections/media-actions/mark-as-watched/_internal/useWatchProgress.ts';
  import * as m from '$lib/paraglide/messages.js';

  type Props = { watchedProps: MarkAsWatchedStoreProps; title: string };
  const { watchedProps, title }: Props = $props();

  const { markAsWatched, removeWatched, isWatched, isMarkingAsWatched, isWatchable } =
    $derived(useMarkAsWatched(watchedProps));
  const { progress } = $derived(useWatchProgress(watchedProps));

  const fill = $derived.by(() => {
    if ($progress === undefined) return undefined;

    return $isWatched ? 100 : $progress;
  });

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
    {#if fill !== undefined}
      <span class="progress-track" aria-hidden="true">
        <span class="progress-fill" style:width="{fill}%"></span>
      </span>
    {/if}
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
    position: relative;
    isolation: isolate;
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
      color var(--transition-increment) ease-in-out;

    &::before {
      content: "";
      position: absolute;
      inset: calc(-1 * var(--border-thickness-xs));
      z-index: -1;
      border-radius: inherit;
      background: var(--trakttime-gradient);
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--transition-increment) ease-in-out;
    }

    :global(svg) {
      width: var(--ni-18);
      height: var(--ni-18);
    }

    &.is-watched {
      border-color: transparent;
      color: var(--trakttime-accent-foreground);
      transition-delay: var(--transition-duration-short);

      &::before {
        opacity: 1;
        transition-delay: var(--transition-duration-short);
      }
    }

    &.is-caught-up {
      color: var(--shade-10);

      &::before {
        background: var(--green-600);
      }
    }

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }

  .progress-track {
    position: absolute;
    inset: 0;
    z-index: -2;
    overflow: hidden;
    border-radius: inherit;
    background: color-mix(in srgb, var(--trakttime-accent) 14%, transparent);
    pointer-events: none;
  }

  .progress-fill {
    display: block;
    height: 100%;
    border-start-end-radius: var(--trakttime-radius-pill);
    border-end-end-radius: var(--trakttime-radius-pill);
    background: color-mix(in srgb, var(--trakttime-accent) 38%, transparent);
    transition: width var(--transition-duration-short) ease-in-out;
  }
</style>
