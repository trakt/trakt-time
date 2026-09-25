<script lang="ts">
  import { fade } from "svelte/transition";
  import * as m from "$lib/paraglide/messages.js";

  const uid = $props.id();
  const gradientId = `trakttime-loader-${uid}`;

  const bars = [14, 18, 22];
  const stems = [20, 24, 28];
</script>

<div
  class="loading-indicator"
  in:fade={{ duration: 150 }}
  role="status"
  aria-label={m.text_loading()}
>
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <defs>
      <linearGradient
        id={gradientId}
        x1="0"
        y1="48"
        x2="48"
        y2="0"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" style:stop-color="var(--rose-500)" />
        <stop offset="100%" style:stop-color="var(--purple-500)" />
      </linearGradient>
    </defs>

    <g stroke="url(#{gradientId})" stroke-width="2.6" stroke-linecap="round">
      {#each bars as y, i (y)}
        <line
          class="loader-line"
          style:--i={i}
          x1="11"
          y1={y}
          x2="37"
          y2={y}
          pathLength="1"
        />
      {/each}
      {#each stems as x, i (x)}
        <line
          class="loader-line"
          style:--i={i + bars.length}
          x1={x}
          y1="23"
          x2={x}
          y2="40"
          pathLength="1"
        />
      {/each}
    </g>
  </svg>
</div>

<style>
  .loading-indicator {
    display: flex;
    justify-content: center;
    overflow: hidden;

    svg {
      width: var(--ni-48);
      height: var(--ni-48);
    }
  }

  .loader-line {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: draw 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
    animation-delay: calc(var(--i) * 0.09s);
  }

  @keyframes draw {
    0% {
      stroke-dashoffset: 1;
      opacity: 0.35;
    }
    35%,
    65% {
      stroke-dashoffset: 0;
      opacity: 1;
    }
    100% {
      stroke-dashoffset: -1;
      opacity: 0.35;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .loader-line {
      stroke-dashoffset: 0;
      animation: pulse 1.6s ease-in-out infinite;
    }

    @keyframes pulse {
      50% {
        opacity: 0.4;
      }
    }
  }
</style>
