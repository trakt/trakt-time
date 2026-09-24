import { AnalyticsEvent } from '$lib/features/analytics/events/AnalyticsEvent.ts';
import { useTrack } from '$lib/features/analytics/useTrack.ts';
import { useUser } from '$lib/features/auth/stores/useUser.ts';
import type { MediaStoreProps } from '$lib/models/MediaStoreProps.ts';
import { InvalidateAction } from '$lib/requests/models/InvalidateAction.ts';
import type { MediaStatus } from '$lib/requests/models/MediaStatus.ts';
import { markAsWatchedRequest } from '$lib/requests/sync/markAsWatchedRequest.ts';
import { removeRatingRequest } from '$lib/requests/sync/removeRatingRequest.ts';
import { removeWatchedRequest } from '$lib/requests/sync/removeWatchedRequest.ts';
import { toRemoveRatingsPayload } from '$lib/requests/sync/toRemoveRatingsPayload.ts';
import { useInvalidator } from '$lib/stores/useInvalidator.ts';
import { hasAired } from '$lib/utils/media/hasAired.ts';
import { resolve } from '$lib/utils/store/resolve.ts';
import { BehaviorSubject, filter } from 'rxjs';
import type { MarkAsWatchedAt } from '../../../models/MarkAsWatchedAt.ts';
import { findOrphanedRatingIds } from './findOrphanedRatingIds.ts';
import { toMarkAsWatchedPayload } from './toMarkAsWatchedPayload.ts';
import { useIsWatched } from './useIsWatched.ts';

export type MarkAsWatchedStoreProps = MediaStoreProps<
  { id: number; effectiveReleaseDate: Date; status?: MediaStatus }
>;

export function useMarkAsWatched(
  props: MarkAsWatchedStoreProps,
) {
  const { type } = props;
  const media = Array.isArray(props.media) ? props.media : [props.media];
  const isMarkingAsWatched = new BehaviorSubject(false);
  const { user, history, ratings } = useUser();
  const { invalidate } = useInvalidator();
  const { track } = useTrack(AnalyticsEvent.MarkAsWatched);

  const { isWatched } = useIsWatched(props);

  const markAsWatched = async (watchedAt?: MarkAsWatchedAt) => {
    const current = await resolve(user);

    if (!current) {
      return;
    }

    const watchedAtDate = watchedAt ?? 'now';

    isMarkingAsWatched.next(true);
    track({ action: 'add' });

    await markAsWatchedRequest({
      body: toMarkAsWatchedPayload(props, watchedAtDate),
    });

    await invalidate(InvalidateAction.MarkAsWatched(type));

    isMarkingAsWatched.next(false);
  };

  const resolveOrphanedRatingIds = async () => {
    const [currentHistory, currentRatings] = await Promise.all([
      resolve(history.pipe(filter((value) => value !== null))),
      resolve(ratings),
    ]);

    return findOrphanedRatingIds({
      target: props,
      history: currentHistory,
      ratings: currentRatings,
    });
  };

  const removeOrphanedRatings = async (ids: ReadonlyArray<number>) => {
    if (ids.length === 0) return;

    await removeRatingRequest({ body: toRemoveRatingsPayload(type, ids) });
    await invalidate(InvalidateAction.Rated(type));
  };

  const removeWatched = async () => {
    isMarkingAsWatched.next(true);
    track({ action: 'remove' });

    const orphanedRatingIds = await resolveOrphanedRatingIds().catch(() => []);

    await removeWatchedRequest({
      body: toMarkAsWatchedPayload(props),
    });
    await removeOrphanedRatings(orphanedRatingIds);

    await invalidate(InvalidateAction.MarkAsWatched(type));

    isMarkingAsWatched.next(false);
  };

  const isWatchable = media.every((item) => {
    return hasAired({
      ...item,
      type,
    });
  });

  return {
    markAsWatched,
    removeWatched,
    isWatched,
    isMarkingAsWatched,
    isWatchable,
  };
}
