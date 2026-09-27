<script lang="ts">
  import { finishAfter } from "../_internal/finishAfter.ts";

  const { onDone }: { onDone: () => void } = $props();

  finishAfter(() => onDone(), 1150);
</script>

<svg class="trakt-big-heart" viewBox="0 0 24 24" aria-hidden="true">
  <path
    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
  />
</svg>

<style>
  .trakt-big-heart {
    position: absolute;
    left: 50%;
    top: 38%;
    width: var(--ni-120);
    height: var(--ni-120);
    translate: -50% -50%;
    fill: var(--rose-500);
    filter: drop-shadow(
      0 var(--ni-8) var(--ni-24) color-mix(in srgb, var(--rose-500) 45%, transparent)
    );
    animation: big-heart 1100ms ease-out both;
  }

  @keyframes big-heart {
    0% {
      opacity: 0.9;
      transform: scale(0);
    }
    25% {
      opacity: 1;
      transform: scale(1.15);
    }
    40% {
      transform: scale(0.95);
    }
    70% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(1.3);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .trakt-big-heart {
      display: none;
    }
  }
</style>
