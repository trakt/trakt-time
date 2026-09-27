<script lang="ts" module>
  import { random } from "$lib/utils/number/random.ts";

  const DROP_COUNT = 16;

  function drops() {
    return Array.from({ length: DROP_COUNT }, () => ({
      x: random(-16, 16),
      delay: random(200, 1200),
    }));
  }
</script>

<script lang="ts">
  import { finishAfter } from "../_internal/finishAfter.ts";
  import type { DelightOrigin } from "../models/DelightOrigin.ts";

  const { origin, onDone }: { origin: DelightOrigin; onDone: () => void } =
    $props();

  const rain = drops();

  finishAfter(() => onDone(), 2000);
</script>

<div
  class="trakt-rain-cloud"
  style="--origin-x: {origin.x}px; --origin-y: {origin.y}px;"
  aria-hidden="true"
>
  <svg class="cloud" viewBox="0 0 48 28" width="48" height="28">
    <path d="M13 27a11 11 0 0 1-1.6-21.9A12 12 0 0 1 34 6.5 10 10 0 1 1 37 27z" />
  </svg>

  {#each rain as drop, index (index)}
    <span
      class="raindrop"
      style="--drop-x: {drop.x}px; --delay: {drop.delay}ms;"
    ></span>
  {/each}
</div>

<style>
  .trakt-rain-cloud {
    position: absolute;
    left: calc(var(--origin-x) + var(--ni-8));
    top: calc(var(--origin-y) - var(--ni-44));
    pointer-events: none;

    > * {
      position: absolute;
      top: 0;
      left: 0;
    }
  }

  .cloud {
    margin: calc(var(--ni-24) * -1) 0 0 calc(var(--ni-24) * -1);
    fill: var(--shade-400);
    animation: cloud-drift 1900ms ease-in-out both;
  }

  .raindrop {
    left: var(--drop-x);
    top: var(--ni-6);
    width: var(--ni-2);
    height: var(--ni-8);
    border-radius: var(--ni-2);
    background-color: var(--blue-400);
    animation: rain-fall 460ms ease-in var(--delay) both;
  }

  @keyframes cloud-drift {
    0% {
      opacity: 0;
      transform: translateY(-10px) scale(0.8);
    }
    15% {
      opacity: 1;
      transform: none;
    }
    50% {
      transform: translateX(-3px);
    }
    80% {
      opacity: 1;
      transform: translateX(3px);
    }
    100% {
      opacity: 0;
      transform: translateY(-6px);
    }
  }

  @keyframes rain-fall {
    0% {
      opacity: 0;
      transform: translateY(0);
    }
    10% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(40px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .trakt-rain-cloud {
      display: none;
    }
  }
</style>
