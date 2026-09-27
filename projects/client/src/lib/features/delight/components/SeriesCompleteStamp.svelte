<script lang="ts">
  import { useUser } from "$lib/features/auth/stores/useUser.ts";
  import { getLocale } from "$lib/features/i18n/index.ts";
  import * as m from "$lib/paraglide/messages.js";
  import type { MediaStatus } from "$lib/requests/models/MediaStatus.ts";
  import {
    type MarkAsWatchedStoreProps,
    useMarkAsWatched,
  } from "$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts";
  import { hasEnded } from "$lib/utils/media/hasEnded.ts";
  import { vibrate } from "../_internal/motion.ts";
  import { isSeriesFinale } from "../delightRules.ts";
  import { useDelight } from "../useDelight.ts";

  type Props = {
    watchedProps: MarkAsWatchedStoreProps;
    showId: number;
    episodeType: string;
    showStatus: MediaStatus;
    episodeCount: number;
    totalRuntime: number;
    isComplete?: boolean;
  };

  let {
    watchedProps,
    showId,
    episodeType,
    showStatus,
    episodeCount,
    totalRuntime,
    isComplete = $bindable(false),
  }: Props = $props();

  const isFinale = $derived(
    isSeriesFinale({ episodeType, hasEnded: hasEnded(showStatus) }),
  );
  const { isWatched } = $derived(useMarkAsWatched(watchedProps));
  const { claim } = useDelight("finale");

  const totals = $derived(
    [
      m.tag_text_number_of_episodes({ count: episodeCount }),
      new Intl.NumberFormat(getLocale(), {
        style: "unit",
        unit: "hour",
        unitDisplay: "long",
      }).format(Math.round(totalRuntime / 60)),
    ].join(" · "),
  );

  let wasWatched: boolean | null = null;

  async function completeSeries() {
    if (!(await claim({ onceKey: String(showId) }))) return;

    isComplete = true;
    vibrate(14);
  }

  const { history } = useUser();

  $effect(() => {
    const watched = $isWatched;
    if ($history == null) return;

    const previous = wasWatched;
    wasWatched = watched;
    if (!isFinale || previous !== false || !watched) return;

    completeSeries();
  });
</script>

{#if isComplete}
  <div class="trakt-series-complete">
    <span class="series-stamp">{m.delight_series_complete()}</span>
    {#if Number.isFinite(totalRuntime)}
      <span class="series-totals">{totals}</span>
    {/if}
  </div>
{/if}

<style>
  .trakt-series-complete {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--gap-s);
  }

  .series-stamp {
    rotate: -6deg;
    padding: var(--ni-2) var(--gap-xs);
    border: var(--border-thickness-s) solid var(--rose-500);
    border-radius: var(--border-radius-s);
    color: var(--rose-500);
    font-family: var(--trakttime-font-heading);
    font-size: 0.8125rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    white-space: nowrap;
    animation: series-stamp 260ms cubic-bezier(0.3, 1.4, 0.5, 1) 600ms both;
  }

  .series-totals {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
    animation: series-totals 400ms ease-out 900ms both;
  }

  @keyframes series-stamp {
    from {
      opacity: 0;
      transform: scale(2.2);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes series-totals {
    from {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .series-stamp,
    .series-totals {
      animation: none;
    }
  }
</style>
