import { afterNavigate } from '$app/navigation';
import { tick } from 'svelte';

type UseWatchlistRevealParams = {
  loading: () => boolean;
  hasHistory: () => boolean;
  hasContent: () => boolean;
  anchor: () => HTMLElement | null;
};

/*
 * Watchlist pages render history above the main content and land the
 * viewport on the content divider before revealing anything, so the user
 * never sees the page flash at the top of history and snap down.
 *
 * The reveal waits until every involved query settles and - when both
 * history and content will render - until the anchor element is actually
 * bound; the effect re-runs when the anchor binds. Re-arms on every
 * client-side navigation (afterNavigate also fires on initial mount).
 *
 * Must be called during component init (uses $effect / afterNavigate).
 */
export function useWatchlistReveal(
  { loading, hasHistory, hasContent, anchor }: UseWatchlistRevealParams,
) {
  let isReady = $state(false);
  let pendingScroll = $state(true);

  afterNavigate(async () => {
    pendingScroll = true;
    isReady = false;
    await tick();
  });

  $effect(() => {
    if (!pendingScroll) return;

    if (loading()) return;

    // Final composition is decided. If we expect to scroll past the
    // history block, the anchor must already exist in the DOM.
    if (hasHistory() && hasContent() && !anchor()) return;

    pendingScroll = false;

    const el = anchor();
    if (el && hasHistory()) {
      el.scrollIntoView({ block: 'start' });
    }
    isReady = true;
  });

  return {
    get isReady() {
      return isReady;
    },
  };
}
