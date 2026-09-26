import { AnalyticsEvent } from '$lib/features/analytics/events/AnalyticsEvent.ts';
import { useTrack } from '$lib/features/analytics/useTrack.ts';
import { useUser } from '$lib/features/auth/stores/useUser.ts';
import { useQuery } from '$lib/features/query/useQuery.ts';
import { InvalidateAction } from '$lib/requests/models/InvalidateAction.ts';
import {
  commentReactionsQuery,
  type Reaction,
} from '$lib/requests/queries/comments/commentReactionsQuery.ts';
import { reactCommentRequest } from '$lib/requests/queries/comments/reactCommentRequest.ts';
import { removeReactionCommentRequest } from '$lib/requests/queries/comments/removeReactionCommentRequest.ts';
import { useInvalidator } from '$lib/stores/useInvalidator.ts';
import { BehaviorSubject, map } from 'rxjs';
import { toReactionSummary } from './toReactionSummary.ts';

export function useCommentReaction({ id }: { id: number }) {
  const { track } = useTrack(AnalyticsEvent.React);
  const { reactions } = useUser();
  const { invalidate } = useInvalidator();
  const summaryQuery = useQuery(commentReactionsQuery({ id }));

  const isReacting = new BehaviorSubject(false);

  const currentReaction = reactions.pipe(
    map(($reactions) => $reactions?.get(id)?.reaction ?? null),
  );
  const summary = summaryQuery.pipe(
    map((query) => toReactionSummary(query.data)),
  );

  const withReacting = async (action: () => Promise<unknown>) => {
    isReacting.next(true);
    await action()
      .then(() => invalidate(InvalidateAction.React))
      .finally(() => isReacting.next(false));
  };

  const remove = () =>
    withReacting(() => {
      track({ action: 'remove', type: 'comment' });
      return removeReactionCommentRequest({ id });
    });

  const react = (reaction: Reaction) =>
    withReacting(async () => {
      track({ action: 'add', type: 'comment' });
      await removeReactionCommentRequest({ id });
      return reactCommentRequest({ id, reaction_type: reaction });
    });

  return { currentReaction, summary, isReacting, react, remove };
}
