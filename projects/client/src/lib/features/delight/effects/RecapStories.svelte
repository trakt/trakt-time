<script lang="ts">
  import { onMount } from "svelte";

  type Slide = { label: string; value: string };

  const SLIDE_DURATION = 1800;

  const {
    slides,
    caption,
    closeLabel,
    onDone,
  }: {
    slides: ReadonlyArray<Slide>;
    caption: string;
    closeLabel: string;
    onDone: () => void;
  } = $props();

  let index = $state(0);
  let root: HTMLElement | null = $state(null);
  const slide = $derived(slides[index]);

  onMount(() => {
    root?.focus();
    const timer = setInterval(() => {
      if (index >= slides.length - 1) {
        clearInterval(timer);
        setTimeout(onDone, SLIDE_DURATION);
        return;
      }
      index += 1;
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  });

  function onKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") onDone();
  }
</script>

<button
  type="button"
  class="trakt-recap-stories"
  aria-label={closeLabel}
  onclick={onDone}
  onkeydown={onKeydown}
  bind:this={root}
>
  <span class="story-bars" aria-hidden="true">
    {#each slides as _, barIndex (barIndex)}
      <span class="story-bar">
        <i
          class:is-done={barIndex < index}
          class:is-active={barIndex === index}
          style="--duration: {SLIDE_DURATION}ms;"
        ></i>
      </span>
    {/each}
  </span>

  {#if slide}
    {#key index}
      <span class="story-slide" aria-live="polite">
        <small>{slide.label}</small>
        <strong>{slide.value}</strong>
      </span>
    {/key}
  {/if}

  <span class="story-caption">{caption}</span>
</button>

<style>
  .trakt-recap-stories {
    all: unset;
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);
    padding: calc(var(--ni-48) + env(safe-area-inset-top, 0px)) var(--gap-l)
      calc(var(--gap-l) + env(safe-area-inset-bottom, 0px));
    background: linear-gradient(
      160deg,
      var(--purple-900),
      var(--purple-500) 60%,
      var(--rose-500)
    );
    color: var(--shade-10);
    pointer-events: auto;
    cursor: pointer;
    animation: story-in 300ms ease-out both;

    &:focus-visible {
      outline: var(--border-thickness-s) solid var(--shade-10);
      outline-offset: calc(var(--border-thickness-s) * -2);
    }
  }

  .story-bars {
    position: absolute;
    top: calc(var(--gap-xl) + env(safe-area-inset-top, 0px));
    inset-inline: var(--gap-m);
    display: flex;
    gap: var(--ni-4);
  }

  .story-bar {
    flex: 1;
    height: var(--ni-4);
    border-radius: var(--ni-4);
    background: color-mix(in srgb, var(--shade-10) 30%, transparent);
    overflow: hidden;

    i {
      display: block;
      width: 0;
      height: 100%;
      background: var(--shade-10);

      &.is-done {
        width: 100%;
      }

      &.is-active {
        animation: story-progress var(--duration) linear forwards;
      }
    }
  }

  .story-slide {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    margin-block: auto;
    animation: story-slide 350ms ease-out both;

    small {
      font-size: 0.8125rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      opacity: 0.8;
    }

    strong {
      font-family: var(--trakttime-font-heading);
      font-size: clamp(2.25rem, 10vw, 3.5rem);
      font-weight: 800;
      line-height: 1.05;
      overflow-wrap: anywhere;
    }
  }

  .story-caption {
    font-size: 0.8125rem;
    opacity: 0.75;
  }

  @keyframes story-in {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
  }

  @keyframes story-slide {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
  }

  @keyframes story-progress {
    to {
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .trakt-recap-stories,
    .story-slide {
      animation: none;
    }
  }
</style>
