<script lang="ts">
  import { finishAfter } from "../_internal/finishAfter.ts";

  const {
    kicker,
    title,
    endsAt,
    credits,
    admit,
    stamp,
    onDone,
  }: {
    kicker: string;
    title: string;
    endsAt: string;
    credits: string | null;
    admit: string;
    stamp: string;
    onDone: () => void;
  } = $props();

  finishAfter(() => onDone(), 3400);
</script>

<div class="trakt-ticket-layer">
  <div class="ticket">
    <div class="ticket-main">
      <span class="ticket-kicker">{kicker}</span>
      <span class="ticket-title">{title}</span>
      <span class="ticket-detail">{endsAt}</span>
      {#if credits}
        <span class="ticket-detail ticket-credits">{credits}</span>
      {/if}
      <span class="ticket-stamp">{stamp}</span>
    </div>
    <div class="ticket-stub">{admit}</div>
  </div>
</div>

<style>
  .trakt-ticket-layer {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: var(--gap-l);
    background: color-mix(in srgb, var(--shade-1000) 35%, transparent);
    animation: ticket-layer 3400ms ease-out both;
  }

  .ticket {
    display: flex;
    max-width: 100%;
    filter: drop-shadow(
      0 var(--ni-12) var(--ni-24) color-mix(in srgb, var(--shade-1000) 30%, transparent)
    );
    animation: ticket-in 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .ticket-main,
  .ticket-stub {
    background: var(--shade-10);
    color: var(--shade-950);
  }

  .ticket-main {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--ni-2);
    min-width: 0;
    padding: var(--gap-m) var(--gap-l) var(--gap-m) var(--gap-m);
    border-radius: var(--border-radius-l) 0 0 var(--border-radius-l);
    border-inline-end: var(--border-thickness-s) dashed var(--shade-100);
  }

  .ticket-kicker {
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--shade-600);
  }

  .ticket-title {
    font-family: var(--trakttime-font-heading);
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .ticket-detail {
    font-size: 0.875rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .ticket-credits {
    color: var(--purple-600);
  }

  .ticket-stub {
    display: grid;
    place-items: center;
    padding: var(--gap-m) var(--gap-s);
    border-radius: 0 var(--border-radius-l) var(--border-radius-l) 0;
    font-family: var(--trakttime-font-heading);
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    writing-mode: vertical-rl;
    transform-origin: 0 0;
    animation: ticket-tear 750ms cubic-bezier(0.5, 0, 0.7, 0.4) 700ms both;
  }

  .ticket-stamp {
    position: absolute;
    inset-inline-end: var(--gap-s);
    bottom: var(--gap-xs);
    rotate: -10deg;
    padding: 0 var(--gap-xs);
    border: var(--border-thickness-s) solid var(--rose-500);
    border-radius: var(--border-radius-s);
    color: var(--rose-500);
    font-family: var(--trakttime-font-heading);
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    animation: ticket-stamp 260ms cubic-bezier(0.3, 1.4, 0.5, 1) 1150ms both;
  }

  @keyframes ticket-layer {
    0% {
      opacity: 0;
    }
    6%,
    88% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes ticket-in {
    from {
      transform: translateY(120px) scale(0.9);
    }
    to {
      transform: none;
    }
  }

  @keyframes ticket-tear {
    0% {
      opacity: 1;
      transform: none;
    }
    30% {
      opacity: 1;
      transform: rotate(10deg);
    }
    100% {
      opacity: 0;
      transform: translate(14px, 80px) rotate(28deg);
    }
  }

  @keyframes ticket-stamp {
    from {
      opacity: 0;
      transform: scale(2.2);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ticket,
    .ticket-stamp {
      animation: none;
    }

    .ticket-stub {
      animation: none;
      opacity: 0;
    }
  }
</style>
