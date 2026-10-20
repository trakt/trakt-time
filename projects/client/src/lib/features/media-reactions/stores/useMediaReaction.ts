import { AnalyticsEvent } from '$lib/features/analytics/events/AnalyticsEvent.ts';
import { useTrack } from '$lib/features/analytics/useTrack.ts';
import { InvalidateAction } from '$lib/requests/models/InvalidateAction.ts';
import type { MediaReaction } from '$lib/requests/models/MediaReaction.ts';
import type { MediaType } from '$lib/requests/models/MediaType.ts';
import { reactMediaRequest } from '$lib/requests/queries/media/reactMediaRequest.ts';
import { removeMediaReactionsRequest } from '$lib/requests/queries/media/removeMediaReactionsRequest.ts';
import { useInvalidator } from '$lib/stores/useInvalidator.ts';

type MediaTarget = { type: MediaType; slug: string };
type RemoveParams = MediaTarget & { ids: ReadonlyArray<number> };
type ReactParams = MediaTarget & { reaction: MediaReaction };

export function useMediaReaction() {
  const { track } = useTrack(AnalyticsEvent.React);
  const { invalidate } = useInvalidator();

  const withInvalidation = async (
    type: MediaType,
    request: () => Promise<boolean>,
  ) => {
    const isOk = await request();
    await invalidate(InvalidateAction.MediaReact(type));

    return isOk;
  };

  const remove = (params: RemoveParams) => {
    if (params.ids.length === 0) return Promise.resolve(false);

    track({ action: 'remove', type: params.type });

    return withInvalidation(params.type, () =>
      removeMediaReactionsRequest(params),
    );
  };

  const react = (params: ReactParams) => {
    track({ action: 'add', type: params.type });

    return withInvalidation(params.type, () => reactMediaRequest(params));
  };

  return { react, remove };
}
