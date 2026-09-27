<script lang="ts">
  import { finishAfter } from "../_internal/finishAfter.ts";
  import type { DelightOrigin } from "../models/DelightOrigin.ts";

  const { origin, onDone }: { origin: DelightOrigin; onDone: () => void } =
    $props();

  finishAfter(() => onDone(), 600);
</script>

<span
  class="trakt-ring-pulse"
  style="--origin-x: {origin.x}px; --origin-y: {origin.y}px; --size: {origin.width}px;"
  aria-hidden="true"
></span>

<style>
  .trakt-ring-pulse {
    position: absolute;
    left: var(--origin-x);
    top: var(--origin-y);
    width: var(--size);
    height: var(--size);
    translate: -50% -50%;
    border-radius: 50%;
    border: var(--border-thickness-s) solid var(--trakttime-accent);
    animation: ring-pulse 560ms ease-out both;
  }

  @keyframes ring-pulse {
    from {
      opacity: 0.8;
      transform: scale(0.8);
    }
    to {
      opacity: 0;
      transform: scale(1.9);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .trakt-ring-pulse {
      display: none;
    }
  }
</style>
