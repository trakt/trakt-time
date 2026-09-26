import type {
  Reaction,
  ReactionsSummary,
} from '$lib/requests/queries/comments/commentReactionsQuery.ts';

export type ReactionCount = {
  reaction: Reaction;
  count: number;
};

const PREVIEW_LIMIT = 3;

export function toReactionSummary(
  summary: ReactionsSummary | Nil,
): ReadonlyArray<ReactionCount> {
  if (!summary) return [];

  return Object.entries(summary.distribution)
    .map(([reaction, count]) => ({ reaction: reaction as Reaction, count }))
    .filter(({ count }) => count > 0)
    .toSorted((a, b) => b.count - a.count)
    .slice(0, PREVIEW_LIMIT);
}
