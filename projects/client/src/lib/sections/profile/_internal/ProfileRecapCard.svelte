<script lang="ts">
  import { playEffect } from '$lib/features/delight/_internal/playEffect.ts';
  import RecapStories from '$lib/features/delight/effects/RecapStories.svelte';
  import { useDelight } from '$lib/features/delight/useDelight.ts';
  import { getLocale } from '$lib/features/i18n/index.ts';
  import * as m from '$lib/paraglide/messages.js';
  import { toTranslatedGenre } from '$lib/utils/formatting/string/toTranslatedGenre.ts';
  import type { MonthRecap } from './toMonthRecap.ts';
  import { toShortWatchTime } from './toUnitLabelParts.ts';
  import { toWatchTime } from './toWatchTime.ts';

  const RECAP_DAYS = 7;

  const { recap }: { recap: MonthRecap | null } = $props();

  const locale = getLocale();
  const { claim, isFresh, isEnabled } = useDelight('recap');

  let isOpened = $state(false);

  const monthKey = $derived(
    recap ? `${recap.month.getFullYear()}-${recap.month.getMonth() + 1}` : '',
  );
  const monthName = $derived(
    recap
      ? new Intl.DateTimeFormat(locale, { month: 'long' }).format(recap.month)
      : '',
  );
  const isVisible = $derived(
    $isEnabled &&
      recap != null &&
      recap.minutes > 0 &&
      new Date().getDate() <= RECAP_DAYS &&
      !isOpened &&
      isFresh(monthKey),
  );

  function slidesFor(current: MonthRecap) {
    return [
      {
        label: m.delight_recap_watched(),
        value: toShortWatchTime(toWatchTime(current.minutes), locale),
      },
      ...(current.topShow
        ? [{ label: m.delight_recap_top_show(), value: current.topShow }]
        : []),
      ...(current.topGenre
        ? [{
          label: m.delight_recap_top_genre(),
          value: toTranslatedGenre(current.topGenre),
        }]
        : []),
    ];
  }

  async function openRecap() {
    if (!recap || !(await claim({ onceKey: monthKey }))) return;

    isOpened = true;
    playEffect(RecapStories, {
      slides: slidesFor(recap),
      caption: m.delight_recap_caption({ month: monthName }),
      closeLabel: m.button_text_done(),
    });
  }
</script>

{#if isVisible}
  <button type="button" class="recap-card" onclick={openRecap}>
    <strong>{m.delight_recap_ready({ month: monthName })}</strong>
    <span>{m.delight_recap_open()}</span>
  </button>
{/if}

<style lang="scss">
  .recap-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--ni-2);
    width: calc(100% - 2 * var(--trakttime-page-gutter));
    margin: 0 var(--trakttime-page-gutter);
    padding: var(--gap-m);
    border: none;
    border-radius: var(--border-radius-xl);
    background: var(--trakttime-gradient);
    color: var(--trakttime-accent-foreground);
    font: inherit;
    text-align: start;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: transform var(--transition-increment) ease-out;

    strong {
      font-family: var(--trakttime-font-heading);
      font-size: 1.125rem;
      font-weight: 700;
    }

    span {
      font-size: 0.8125rem;
      opacity: 0.85;
    }

    &:active {
      transform: scale(0.98);
    }
  }
</style>
