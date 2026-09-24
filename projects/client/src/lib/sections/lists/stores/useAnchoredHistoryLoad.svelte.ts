type UseAnchoredHistoryLoadParams = {
  loading: () => boolean;
  entryCount: () => number;
  fetchOlder: () => Promise<void>;
};

/*
 * Keeps the viewport anchored to the content the user is reading while
 * older history rows prepend above it.
 *
 * The height added above the fold is re-applied to the CURRENT scroll
 * position (not a click-time snapshot), so scrolling during the fetch is
 * preserved. Compensation waits for the entry count to actually GROW -
 * the list store re-emits with an identical count when the loading flag
 * flips, and reacting to that would consume the pending height before
 * the rows land. A fetch that settles without adding rows (failure, or a
 * page that fully dedupes away) disarms instead of leaving the
 * compensation primed for the next unrelated list change.
 *
 * Must be called during component init (uses $effect).
 */
export function useAnchoredHistoryLoad(
  { loading, entryCount, fetchOlder }: UseAnchoredHistoryLoadParams,
) {
  let pendingHeight: number | null = null;
  let lastCount = 0;

  // Runs after the DOM reflects the new rows; declared before the disarm
  // effect so a flush that lands rows and settles loading in one go
  // compensates first.
  $effect(() => {
    const count = entryCount();
    const grew = count > lastCount;
    lastCount = count;

    if (pendingHeight == null || !grew) return;

    const delta = document.documentElement.scrollHeight - pendingHeight;
    pendingHeight = null;

    if (delta > 0) {
      globalThis.scrollBy({ top: delta, behavior: 'instant' });
    }
  });

  $effect(() => {
    if (!loading() && pendingHeight != null) {
      pendingHeight = null;
    }
  });

  return function loadOlder() {
    pendingHeight = document.documentElement.scrollHeight;
    return fetchOlder();
  };
}
