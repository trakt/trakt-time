import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
import { useQuery } from '$lib/features/query/useQuery.ts';
import type { MediaReactionSummary } from '$lib/requests/models/MediaReactionSummary.ts';
import type { UserMediaReaction } from '$lib/requests/models/UserMediaReaction.ts';
import { mediaReactionsSummaryQuery } from '$lib/requests/queries/media/mediaReactionsSummaryQuery.ts';
import { userMediaReactionsQuery } from '$lib/requests/queries/users/userMediaReactionsQuery.ts';
import { toMediaReactionDistribution } from '$lib/utils/reactions/toMediaReactionDistribution.ts';
import { map, type Observable } from 'rxjs';
import type { MediaReactionsTarget } from '../MediaReactionsTarget.ts';

type MediaReactions = {
  summary: Observable<MediaReactionSummary>;
  held: Observable<ReadonlyArray<UserMediaReaction>>;
  isLoading: Observable<boolean>;
};

const EMPTY_SUMMARY: MediaReactionSummary = {
  totalCount: 0,
  distribution: toMediaReactionDistribution({}),
  top: [],
};

export function useMediaReactions({
  type,
  slug,
  id,
}: MediaReactionsTarget): MediaReactions {
  const { isAuthorized } = useAuth();

  const summary = useQuery(mediaReactionsSummaryQuery({ type, slug }));
  const mine = useQuery(
    isAuthorized.pipe(
      map((enabled) => userMediaReactionsQuery({ type, id, enabled })),
    ),
  );

  return {
    summary: summary.pipe(map(($summary) => $summary.data ?? EMPTY_SUMMARY)),
    held: mine.pipe(map(($mine) => $mine.data ?? [])),
    isLoading: summary.pipe(map(($summary) => $summary.isPending)),
  };
}
