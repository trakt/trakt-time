import { AnalyticsEvent } from '$lib/features/analytics/events/AnalyticsEvent.ts';
import { useTrack } from '$lib/features/analytics/useTrack.ts';
import { useUser } from '$lib/features/auth/stores/useUser.ts';
import { ConfirmationType } from '$lib/features/confirmation/models/ConfirmationType.ts';
import { useConfirm } from '$lib/features/confirmation/useConfirm.ts';
import { InvalidateAction } from '$lib/requests/models/InvalidateAction.ts';
import { dropShowRequest } from '$lib/requests/queries/users/dropShowRequest.ts';
import { hideShowCalendarRequest } from '$lib/requests/queries/users/hideShowCalendarRequest.ts';
import { restoreShowCalendarRequest } from '$lib/requests/queries/users/restoreShowCalendarRequest.ts';
import { restoreShowProgressRequest } from '$lib/requests/queries/users/restoreShowProgressRequest.ts';
import { useInvalidator } from '$lib/stores/useInvalidator.ts';
import { BehaviorSubject, map } from 'rxjs';
import { toBulkPayload } from '../_internal/toBulkPayload.ts';

type UseDropShowProps = {
  id: number;
  title: string;
};

export function useDropShow({ id, title }: UseDropShowProps) {
  const { dropped } = useUser();
  const { invalidate } = useInvalidator();
  const { confirm } = useConfirm();
  const { track: trackDrop } = useTrack(AnalyticsEvent.Drop);
  const { track: trackRestore } = useTrack(AnalyticsEvent.Restore);

  const isUpdatingDrop = new BehaviorSubject(false);
  const isDropped = dropped.pipe(
    map(($dropped) => $dropped?.shows.has(id) ?? false),
  );

  const withUpdating = async (action: () => Promise<unknown>) => {
    isUpdatingDrop.next(true);
    await action().finally(() => isUpdatingDrop.next(false));
  };

  const payload = () => ({ body: toBulkPayload('show', [id]) });

  const dropShow = confirm({
    type: ConfirmationType.DropShow,
    title,
    onConfirm: () =>
      withUpdating(async () => {
        trackDrop({ type: 'show' });
        await Promise.all([
          dropShowRequest(payload()),
          hideShowCalendarRequest(payload()),
        ]);
        await invalidate(InvalidateAction.Drop('show'));
      }),
  });

  const restoreShow = confirm({
    type: ConfirmationType.RestoreShow,
    title,
    onConfirm: () =>
      withUpdating(async () => {
        trackRestore();
        await Promise.all([
          restoreShowProgressRequest(payload()),
          restoreShowCalendarRequest(payload()),
        ]);
        await invalidate(InvalidateAction.Restore);
      }),
  });

  return { isDropped, isUpdatingDrop, dropShow, restoreShow };
}
