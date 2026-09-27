<script lang="ts">
  import FlameIcon from "$lib/components/icons/FlameIcon.svelte";
  import { useUser } from "$lib/features/auth/stores/useUser.ts";
  import * as m from "$lib/paraglide/messages.js";
  import { map } from "rxjs";
  import { animate } from "../_internal/motion.ts";
  import { activeBinge } from "../delightRules.ts";
  import { useDelight } from "../useDelight.ts";

  const STREAK_THRESHOLD = 3;
  const BINGE_MODE_THRESHOLD = STREAK_THRESHOLD + 2;

  const { history } = useUser();
  const { claim } = useDelight("binge");

  const binge = history.pipe(
    map(($history) =>
      activeBinge({
        shows: ($history?.shows ?? new Map()).values(),
        now: new Date(),
      })
    ),
  );

  let chip: HTMLElement | null = $state(null);
  let shownCount = $state(0);

  $effect(() => {
    const count = $binge?.count ?? 0;
    if (count < STREAK_THRESHOLD) {
      shownCount = 0;
      return;
    }
    if (count === shownCount) return;

    claim().then((variant) => {
      if (!variant) return;
      shownCount = count;
    });
  });

  $effect(() => {
    if (!chip || shownCount === 0) return;

    animate(
      chip,
      [
        { transform: "scale(0.7)" },
        { transform: "scale(1.15)" },
        { transform: "scale(1)" },
      ],
      { duration: 380, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
    );
  });
</script>

{#if shownCount > 0}
  <span
    class="trakt-binge-streak"
    class:is-binge-mode={shownCount >= BINGE_MODE_THRESHOLD}
    bind:this={chip}
    aria-live="polite"
  >
    <FlameIcon />
    <span>
      {shownCount >= BINGE_MODE_THRESHOLD
        ? m.delight_binge_mode({ count: shownCount })
        : m.delight_binge_count({ count: shownCount })}
    </span>
  </span>
{/if}

<style>
  .trakt-binge-streak {
    display: inline-flex;
    align-items: center;
    gap: var(--gap-xxs);
    height: var(--ni-28);
    padding: 0 var(--gap-s) 0 var(--gap-xs);
    border-radius: var(--trakttime-radius-pill);
    background: color-mix(in srgb, var(--orange-500) 14%, transparent);
    color: var(--color-text-primary);
    font-size: 0.8125rem;
    font-weight: 700;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;

    :global(svg) {
      width: var(--ni-16);
      height: var(--ni-16);
      color: var(--orange-500);
      transform-origin: 50% 90%;
    }

    &.is-binge-mode {
      background: linear-gradient(120deg, var(--yellow-400), var(--orange-500));
      color: var(--shade-900);

      :global(svg) {
        color: var(--shade-900);
        animation: binge-flicker 0.5s ease-in-out infinite alternate;
      }
    }
  }

  @keyframes binge-flicker {
    from {
      transform: scale(1) rotate(-4deg);
    }
    to {
      transform: scale(1.15) rotate(4deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .trakt-binge-streak.is-binge-mode :global(svg) {
      animation: none;
    }
  }
</style>
