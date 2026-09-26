<script lang="ts">
  import ChevronRightIcon from '$lib/components/icons/ChevronRightIcon.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type ScrollRowProps = {
    children: Snippet;
  } & Pick<HTMLAttributes<HTMLDivElement>, 'role' | 'aria-hidden'>;

  const { children, ...rest }: ScrollRowProps = $props();

  const PAGE_RATIO = 0.8;

  let track: HTMLDivElement | undefined = $state();
  let canScrollBack = $state(false);
  let canScrollForward = $state(false);

  function updateScrollState() {
    if (!track) return;
    canScrollBack = track.scrollLeft > 0;
    canScrollForward =
      track.scrollLeft + track.clientWidth < track.scrollWidth - 1;
  }

  function scrollByPage(direction: 1 | -1) {
    track?.scrollBy({
      left: direction * track.clientWidth * PAGE_RATIO,
      behavior: 'smooth',
    });
  }

  $effect(() => {
    if (!track) return;
    updateScrollState();
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(track);
    return () => observer.disconnect();
  });
</script>

<div class="scroll-row">
  <div
    class="scroll-row-track"
    bind:this={track}
    onscroll={updateScrollState}
    {...rest}
  >
    {@render children()}
  </div>
  {#if canScrollBack}
    <button
      class="scroll-row-button is-back"
      type="button"
      aria-label={m.button_label_scroll_back()}
      onclick={() => scrollByPage(-1)}
    >
      <ChevronRightIcon />
    </button>
  {/if}
  {#if canScrollForward}
    <button
      class="scroll-row-button is-forward"
      type="button"
      aria-label={m.button_label_scroll_forward()}
      onclick={() => scrollByPage(1)}
    >
      <ChevronRightIcon />
    </button>
  {/if}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .scroll-row {
    position: relative;
  }

  .scroll-row-track {
    @include scrollable-row;
    padding: 0 var(--trakttime-page-gutter);
    scroll-padding-inline: var(--trakttime-page-gutter);
  }

  .scroll-row-button {
    display: none;

    @include for-mouse {
      position: absolute;
      top: calc(var(--trakttime-poster-card-width) * 0.75);
      transform: translateY(-50%);
      z-index: var(--layer-raised);
      display: grid;
      place-items: center;
      width: var(--ni-40);
      height: var(--ni-40);
      padding: 0;
      border-radius: 50%;
      border: var(--ni-1) solid var(--color-border);
      background: var(--trakttime-navbar-solid-bg);
      color: var(--color-text-primary);
      box-shadow: 0 var(--ni-6) var(--ni-20)
        color-mix(in srgb, var(--shade-1000) 45%, transparent);
      cursor: pointer;
      opacity: 0;
      transition: opacity var(--transition-increment) ease-in-out;

      :global(svg) {
        width: var(--trakttime-icon-sm);
        height: var(--trakttime-icon-sm);
      }
    }
  }

  .scroll-row:hover .scroll-row-button,
  .scroll-row-button:focus-visible {
    opacity: 1;
  }

  .is-back {
    left: var(--gap-xs);

    :global(svg) {
      transform: scaleX(-1);
    }
  }

  .is-forward {
    right: var(--gap-xs);
  }
</style>
