<script lang="ts">
  import CheckInIcon from '$lib/components/icons/CheckInIcon.svelte';
  import { playEffect } from '$lib/features/delight/_internal/playEffect.ts';
  import { vibrate } from '$lib/features/delight/_internal/motion.ts';
  import { checkInSummary } from '$lib/features/delight/delightRules.ts';
  import TicketStub from '$lib/features/delight/effects/TicketStub.svelte';
  import { useDelight } from '$lib/features/delight/useDelight.ts';
  import { getLocale } from '$lib/features/i18n/index.ts';
  import { useNowPlaying } from '$lib/features/toast/useNowPlaying.ts';
  import * as m from '$lib/paraglide/messages.js';
  import type { MarkAsWatchedStoreProps } from '$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts';
  import { useCheckIn } from '$lib/sections/media-actions/check-in/useCheckIn.ts';

  type Props = {
    watchedProps: MarkAsWatchedStoreProps;
    title: string;
    runtime: number;
    postCredits: ReadonlyArray<'during' | 'after'>;
  };

  const { watchedProps, title, runtime, postCredits }: Props = $props();

  const { checkin, isCheckingIn, isCheckedIn, isWatchable } = $derived(
    useCheckIn(watchedProps),
  );
  const { nowPlaying, progress } = useNowPlaying();
  const { claim, isEnabled } = useDelight('check-in');

  const summary = $derived(
    checkInSummary({
      startedAt: $nowPlaying?.startedAt ?? new Date(),
      runtimeMinutes: runtime,
      postCredits,
    }),
  );

  const endsAtLabel = $derived(
    m.delight_ends_at({
      time: new Intl.DateTimeFormat(getLocale(), {
        hour: 'numeric',
        minute: '2-digit',
      }).format($nowPlaying?.expiresAt ?? summary.endsAt),
    }),
  );

  const creditsLabel = $derived.by(() => {
    switch (summary.creditsScene) {
      case 'during':
        return m.delight_scene_during_credits();
      case 'after':
        return m.delight_scene_after_credits();
      case 'both':
        return m.delight_scenes_during_and_after_credits();
      default:
        return null;
    }
  });

  async function checkInWithTicket() {
    await checkin();
    if (!(await claim())) return;

    vibrate(12);
    playEffect(TicketStub, {
      kicker: m.button_text_checkin(),
      title,
      endsAt: endsAtLabel,
      credits: creditsLabel,
      admit: m.delight_admit_one(),
      stamp: m.delight_watching_stamp(),
    });
  }
</script>

{#if $isEnabled && isWatchable}
  <div class="check-in-row">
    {#if $isCheckedIn}
      <div class="check-in-live" aria-live="polite">
        <span class="check-in-status">
          <span class="live-dot" aria-hidden="true"></span>
          {m.button_text_checkin()}
        </span>
        <div class="check-in-progress" aria-hidden="true">
          <span style:width="{Math.min($progress, 100)}%"></span>
        </div>
        <span class="check-in-details">
          <span>{endsAtLabel}</span>
          {#if creditsLabel}
            <span class="check-in-credits">{creditsLabel}</span>
          {/if}
        </span>
      </div>
    {:else}
      <button
        type="button"
        class="check-in-pill"
        disabled={$isCheckingIn}
        onclick={checkInWithTicket}
        aria-label={m.button_label_checkin({ title })}
      >
        <CheckInIcon />
        <span>{m.delight_check_in()}</span>
      </button>
    {/if}
  </div>
{/if}

<style lang="scss">
  .check-in-row {
    width: 100%;
  }

  .check-in-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--gap-xs);
    width: 100%;
    height: var(--ni-48);
    border: none;
    border-radius: var(--trakttime-radius-pill);
    background: var(--trakttime-gradient);
    color: var(--trakttime-accent-foreground);
    font: inherit;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    :global(svg) {
      width: var(--ni-18);
      height: var(--ni-18);
    }

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }

  .check-in-live {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    padding: var(--gap-s) var(--gap-m);
    border-radius: var(--trakttime-radius-card);
    background: var(--color-card-background);
  }

  .check-in-status {
    display: inline-flex;
    align-items: center;
    gap: var(--gap-xs);
    font-weight: 700;
  }

  .live-dot {
    width: var(--ni-8);
    height: var(--ni-8);
    border-radius: 50%;
    background: var(--red-500);
    animation: live-pulse 1.4s ease-out infinite;
  }

  .check-in-progress {
    height: var(--ni-4);
    border-radius: var(--trakttime-radius-pill);
    background: var(--color-border);
    overflow: hidden;

    span {
      display: block;
      height: 100%;
      background: var(--trakttime-gradient);
      transition: width 1s linear;
    }
  }

  .check-in-details {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--gap-xs);
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    font-variant-numeric: tabular-nums;
  }

  .check-in-credits {
    color: var(--trakttime-accent);
    font-weight: 600;
  }

  @keyframes live-pulse {
    from {
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--red-500) 60%, transparent);
    }
    to {
      box-shadow: 0 0 0 var(--ni-8) color-mix(in srgb, var(--red-500) 0%, transparent);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .live-dot {
      animation: none;
    }
  }
</style>
