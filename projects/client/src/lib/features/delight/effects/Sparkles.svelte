<script lang="ts" module>
  import { random } from "$lib/utils/number/random.ts";

  const SPARKLE_COUNT = 10;

  function sparkles(width: number, height: number) {
    return Array.from({ length: SPARKLE_COUNT }, () => ({
      x: random(-width / 2 - 12, width / 2 + 12),
      y: random(-height / 2 - 12, height / 2 + 12),
      size: random(10, 16),
      delay: random(0, 500),
    }));
  }
</script>

<script lang="ts">
  import { finishAfter } from "../_internal/finishAfter.ts";
  import type { DelightOrigin } from "../models/DelightOrigin.ts";

  const { origin, onDone }: { origin: DelightOrigin; onDone: () => void } =
    $props();

  const batch = $derived(sparkles(origin.width, origin.height));

  finishAfter(() => onDone(), 1500);
</script>

<div
  class="trakt-sparkles"
  style="--origin-x: {origin.x}px; --origin-y: {origin.y}px;"
  aria-hidden="true"
>
  {#each batch as sparkle, index (index)}
    <svg
      class="sparkle"
      viewBox="0 0 20 20"
      width={sparkle.size}
      height={sparkle.size}
      style="--x: {sparkle.x}px; --y: {sparkle.y}px; --delay: {sparkle.delay}ms;"
    >
      <path
        d="M10 0c.8 5.2 4.8 9.2 10 10-5.2.8-9.2 4.8-10 10-.8-5.2-4.8-9.2-10-10 5.2-.8 9.2-4.8 10-10z"
      />
    </svg>
  {/each}
</div>

<style>
  .trakt-sparkles {
    position: absolute;
    left: var(--origin-x);
    top: var(--origin-y);
  }

  .sparkle {
    position: absolute;
    left: var(--x);
    top: var(--y);
    translate: -50% -50%;
    fill: var(--yellow-400);
    animation: sparkle-twinkle 800ms ease-out var(--delay) both;
  }

  @keyframes sparkle-twinkle {
    0% {
      opacity: 0;
      transform: scale(0) rotate(0deg);
    }
    40% {
      opacity: 1;
      transform: scale(1) rotate(45deg);
    }
    100% {
      opacity: 0;
      transform: scale(0) rotate(90deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .trakt-sparkles {
      display: none;
    }
  }
</style>
