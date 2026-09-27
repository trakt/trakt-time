<script lang="ts">
  import { finishAfter } from "../_internal/finishAfter.ts";
  import type { DelightOrigin } from "../models/DelightOrigin.ts";

  const FLIGHT_DURATION = 720;

  const {
    origin,
    target,
    imageUrl,
    onLanded,
    onDone,
  }: {
    origin: DelightOrigin;
    target: DelightOrigin;
    imageUrl: string;
    onLanded: () => void;
    onDone: () => void;
  } = $props();

  finishAfter(() => {
    onLanded();
    onDone();
  }, FLIGHT_DURATION);
</script>

<img
  class="trakt-fly-to-tab"
  src={imageUrl}
  alt=""
  style="--origin-x: {origin.x}px; --origin-y: {origin.y}px; --width: {origin.width}px; --height: {origin.height}px; --dx: {target.x - origin.x}px; --dy: {target.y - origin.y}px;"
/>

<style>
  .trakt-fly-to-tab {
    position: absolute;
    left: var(--origin-x);
    top: var(--origin-y);
    width: var(--width);
    height: var(--height);
    translate: -50% -50%;
    object-fit: cover;
    border-radius: var(--border-radius-m);
    box-shadow: 0 var(--ni-8) var(--ni-24)
      color-mix(in srgb, var(--shade-1000) 30%, transparent);
    animation: fly-to-tab 720ms cubic-bezier(0.4, 0, 0.3, 1) both;
  }

  @keyframes fly-to-tab {
    0% {
      transform: translate(0, 0) scale(1);
    }
    45% {
      transform: translate(calc(var(--dx) * 0.4), calc(var(--dy) * 0.25 - 60px))
        scale(0.6) rotate(8deg);
    }
    100% {
      opacity: 0.5;
      transform: translate(var(--dx), var(--dy)) scale(0.1) rotate(16deg);
    }
  }
</style>
