import { AnalyticsEvent } from '$lib/features/analytics/events/AnalyticsEvent.ts';
import { useTrack } from '$lib/features/analytics/useTrack.ts';
import { useUser } from '$lib/features/auth/stores/useUser.ts';
import { ConfirmationType } from '$lib/features/confirmation/models/ConfirmationType.ts';
import { useConfirm } from '$lib/features/confirmation/useConfirm.ts';
import { InvalidateAction } from '$lib/requests/models/InvalidateAction.ts';
import { blockUserRequest } from '$lib/requests/queries/users/blockUserRequest.ts';
import { unblockUserRequest } from '$lib/requests/queries/users/unblockUserRequest.ts';
import { useInvalidator } from '$lib/stores/useInvalidator.ts';
import { BehaviorSubject, map } from 'rxjs';

type UseBlockUserProps = {
  slug: string;
  username: string;
};

export function useBlockUser({ slug, username }: UseBlockUserProps) {
  const { track } = useTrack(AnalyticsEvent.Block);
  const { blocked } = useUser();
  const { invalidate } = useInvalidator();
  const { confirm } = useConfirm();

  const isUpdatingBlock = new BehaviorSubject(false);
  const isBlocked = blocked.pipe(
    map(($blocked) => $blocked.has(slug.toLowerCase())),
  );

  const withUpdating = async (action: () => Promise<unknown>) => {
    isUpdatingBlock.next(true);
    await action()
      .then(() =>
        Promise.all([
          invalidate(InvalidateAction.User.Block),
          invalidate(InvalidateAction.User.Follow),
        ])
      )
      .finally(() => isUpdatingBlock.next(false));
  };

  const blockUser = confirm({
    type: ConfirmationType.BlockUser,
    username,
    onConfirm: () =>
      withUpdating(() => {
        track({ action: 'block' });
        return blockUserRequest({ slug });
      }),
  });

  const unblockUser = () =>
    withUpdating(() => {
      track({ action: 'unblock' });
      return unblockUserRequest({ slug });
    });

  return { isBlocked, isUpdatingBlock, blockUser, unblockUser };
}
