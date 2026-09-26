import {
  currentUserFollowRequestsQuery,
  type UserFollowRequest,
} from '$lib/features/auth/queries/currentUserFollowRequestsQuery.ts';
import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
import { useQuery } from '$lib/features/query/useQuery.ts';
import { InvalidateAction } from '$lib/requests/models/InvalidateAction.ts';
import { approveFollowRequest } from '$lib/requests/queries/users/approveFollowRequest.ts';
import { denyFollowRequest } from '$lib/requests/queries/users/denyFollowRequest.ts';
import { useInvalidator } from '$lib/stores/useInvalidator.ts';
import { BehaviorSubject, map, of, switchMap } from 'rxjs';

export function useFollowRequests() {
  const { isAuthorized } = useAuth();
  const { invalidate } = useInvalidator();
  const requestsQuery = useQuery(currentUserFollowRequestsQuery());

  const pendingRequestIds = new BehaviorSubject<ReadonlySet<number>>(
    new Set(),
  );

  const requests = isAuthorized.pipe(
    switchMap((authorized) =>
      authorized
        ? requestsQuery.pipe(map((query) => query.data ?? []))
        : of<UserFollowRequest[]>([])
    ),
  );

  const respond = async (
    requestId: number,
    request: (params: { requestId: number }) => Promise<boolean>,
  ) => {
    pendingRequestIds.next(new Set([...pendingRequestIds.value, requestId]));
    await request({ requestId })
      .then(async (isOk) => {
        if (isOk) await invalidate(InvalidateAction.User.Follow);
      })
      .finally(() =>
        pendingRequestIds.next(
          new Set(
            [...pendingRequestIds.value].filter((id) => id !== requestId),
          ),
        )
      );
  };

  return {
    requests,
    pendingRequestIds,
    approve: (requestId: number) => respond(requestId, approveFollowRequest),
    deny: (requestId: number) => respond(requestId, denyFollowRequest),
  };
}
