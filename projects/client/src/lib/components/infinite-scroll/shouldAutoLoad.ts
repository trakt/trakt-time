type ShouldAutoLoadParams = {
  isEnabled: boolean;
  isNear: boolean;
  hasMore: boolean;
  isLoading: boolean;
  count: number;
  stalledAtCount: number | null;
};

export function shouldAutoLoad(
  { isEnabled, isNear, hasMore, isLoading, count, stalledAtCount }:
    ShouldAutoLoadParams,
): boolean {
  if (!isEnabled || !isNear || !hasMore || isLoading) return false;

  return stalledAtCount !== count;
}
