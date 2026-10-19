import { AnalyticsEvent } from '$lib/features/analytics/events/AnalyticsEvent.ts';
import { useTrack } from '$lib/features/analytics/useTrack.ts';
import type { MediaStoreProps } from '$lib/models/MediaStoreProps.ts';
import { InvalidateAction } from '$lib/requests/models/InvalidateAction.ts';
import { addToWatchlistRequest } from '$lib/requests/sync/addToWatchlistRequest.ts';
import { removeFromWatchlistRequest } from '$lib/requests/sync/removeFromWatchlistRequest.ts';
import { usePendingIntents } from '$lib/sections/media-actions/_internal/pendingIntents.ts';
import { toBulkPayload } from '$lib/sections/media-actions/_internal/toBulkPayload.ts';
import { withPendingIntent } from '$lib/sections/media-actions/_internal/withPendingIntent.ts';
import { useInvalidator } from '$lib/stores/useInvalidator.ts';
import { useIsWatchlisted } from '$lib/stores/useIsWatchlisted.ts';

export function useWatchlist(props: MediaStoreProps) {
  const { type } = props;
  const media = Array.isArray(props.media) ? props.media : [props.media];
  const { invalidate } = useInvalidator();
  const { track } = useTrack(AnalyticsEvent.Watchlist);

  const ids = media.map(({ id }) => id);

  const { isWatchlisted: isWatchlistedOnServer } = useIsWatchlisted(props);
  const body = toBulkPayload(type, ids);

  const pending = usePendingIntents(`watchlist:${type}:${ids.join(',')}`);
  const isWatchlistUpdating = pending.isPending;
  const isWatchlisted = withPendingIntent({
    current: isWatchlistedOnServer,
    isAdding: pending.isAdding,
    isRemoving: pending.isRemoving,
  });

  const addToWatchlist = async () => {
    if (type === 'episode') {
      return;
    }

    track({ action: 'add' });

    await pending.run('add', async () => {
      await addToWatchlistRequest({
        body,
      });

      await invalidate(InvalidateAction.Watchlisted(type));
    });
  };

  const removeFromWatchlist = async () => {
    if (type === 'episode') {
      return;
    }

    track({ action: 'remove' });

    await pending.run('remove', async () => {
      await removeFromWatchlistRequest({
        body,
      });

      await invalidate(InvalidateAction.Watchlisted(type));
    });
  };

  return {
    isWatchlistUpdating,
    isWatchlisted,
    addToWatchlist,
    removeFromWatchlist,
  };
}
