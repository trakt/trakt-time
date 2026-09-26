import { AnalyticsEvent } from '$lib/features/analytics/events/AnalyticsEvent.ts';
import { useTrack } from '$lib/features/analytics/useTrack.ts';
import { currentUserPendingFollowsQuery } from '$lib/features/auth/queries/currentUserPendingFollowsQuery.ts';
import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
import { useUser } from '$lib/features/auth/stores/useUser.ts';
import { ConfirmationType } from '$lib/features/confirmation/models/ConfirmationType.ts';
import { useConfirm } from '$lib/features/confirmation/useConfirm.ts';
import { useQuery } from '$lib/features/query/useQuery.ts';
import { InvalidateAction } from '$lib/requests/models/InvalidateAction.ts';
import type { UserProfile } from '$lib/requests/models/UserProfile.ts';
import { followUserRequest } from '$lib/requests/queries/users/followUserRequest.ts';
import { unfollowUserRequest } from '$lib/requests/queries/users/unfollowUserRequest.ts';
import { useInvalidator } from '$lib/stores/useInvalidator.ts';
import { BehaviorSubject, combineLatest, map, of, switchMap } from 'rxjs';
import { isSameSlug } from './isSameSlug.ts';
import type { FollowStatus } from './models/FollowStatus.ts';

type UseFollowUserProps = {
  slug: string;
  username: string;
};

export function toFollowStatus(
  { slug, following, pending }: {
    slug: string;
    following: ReadonlyArray<UserProfile>;
    pending: ReadonlyArray<UserProfile>;
  },
): FollowStatus {
  const isSameUser = (user: UserProfile) => isSameSlug(user.slug, slug);

  if (following.some(isSameUser)) return 'following';
  if (pending.some(isSameUser)) return 'pending';
  return 'none';
}

export function useFollowUser({ slug, username }: UseFollowUserProps) {
  const { track } = useTrack(AnalyticsEvent.Follow);
  const { isAuthorized } = useAuth();
  const { network } = useUser();
  const { invalidate } = useInvalidator();
  const { confirm } = useConfirm();
  const pendingQuery = useQuery(currentUserPendingFollowsQuery());

  const isUpdatingFollow = new BehaviorSubject(false);

  const pending = isAuthorized.pipe(
    switchMap((authorized) =>
      authorized
        ? pendingQuery.pipe(map((query) => query.data ?? []))
        : of<UserProfile[]>([])
    ),
  );

  const followStatus = combineLatest([network, pending]).pipe(
    map(([$network, $pending]) =>
      toFollowStatus({
        slug,
        following: $network?.following ?? [],
        pending: $pending,
      })
    ),
  );

  const withUpdating = async (action: () => Promise<unknown>) => {
    isUpdatingFollow.next(true);
    await action()
      .then(() => invalidate(InvalidateAction.User.Follow))
      .finally(() => isUpdatingFollow.next(false));
  };

  const followUser = () =>
    withUpdating(() => {
      track({ action: 'follow' });
      return followUserRequest({ slug });
    });

  const cancelFollowRequest = () =>
    withUpdating(() => {
      track({ action: 'cancel-follow-request' });
      return unfollowUserRequest({ slug });
    });

  const unfollowUser = confirm({
    type: ConfirmationType.UnfollowUser,
    username,
    onConfirm: () =>
      withUpdating(() => {
        track({ action: 'unfollow' });
        return unfollowUserRequest({ slug });
      }),
  });

  return {
    followStatus,
    isUpdatingFollow,
    followUser,
    unfollowUser,
    cancelFollowRequest,
  };
}
