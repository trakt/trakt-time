import type { UserLimits } from '$lib/requests/models/UserLimits.ts';
import type { ImportCounts } from './ImportTypes.ts';

type ExceedsFreeImportLimitsParams = {
  counts: ImportCounts;
  limits: UserLimits;
};

export function exceedsFreeImportLimits(
  { counts, limits }: ExceedsFreeImportLimitsParams,
): boolean {
  return counts.history > limits.history.free ||
    counts.watchlist > limits.watchlistItems.free ||
    counts.list > limits.totalListItems.free;
}
