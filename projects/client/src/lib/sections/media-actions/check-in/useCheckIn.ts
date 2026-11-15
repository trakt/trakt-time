import { useActionToast } from '$lib/features/action-toast/useActionToast.ts';
import { AnalyticsEvent } from '$lib/features/analytics/events/AnalyticsEvent.ts';
import { useTrack } from '$lib/features/analytics/useTrack.ts';
import { useNowPlaying } from '$lib/features/toast/useNowPlaying.ts';
import * as m from '$lib/paraglide/messages.js';
import { InvalidateAction } from '$lib/requests/models/InvalidateAction.ts';
import { checkinEpisodeRequest } from '$lib/requests/queries/checkin/checkinEpisodeRequest.ts';
import { checkinMovieRequest } from '$lib/requests/queries/checkin/checkinMovieRequest.ts';
import { useInvalidator } from '$lib/stores/useInvalidator.ts';
import { hasAired } from '$lib/utils/media/hasAired.ts';
import type { MovieCheckinRequest, ShowCheckinRequest } from '@trakt/api';
import { BehaviorSubject, map } from 'rxjs';
import type { MarkAsWatchedStoreProps } from '../mark-as-watched/useMarkAsWatched.ts';

export type UseCheckInProps = MarkAsWatchedStoreProps;

type EpisodeProps = {
  episode: { season: number; number: number };
  show: { id: number };
};

type MovieProps = {
  id: number;
};

function mapToEpisodePayload({
  show,
  episode,
}: EpisodeProps): ShowCheckinRequest {
  return {
    show: {
      ids: {
        trakt: show.id,
      },
    },
    episode: {
      season: episode.season,
      number: episode.number,
    },
  };
}

function mapToMoviePayload(media: MovieProps): MovieCheckinRequest {
  return {
    movie: {
      ids: {
        trakt: media.id,
      },
    },
  };
}

export function useCheckIn(props: UseCheckInProps) {
  const { type } = props;
  const isCheckingIn = new BehaviorSubject(false);
  const { invalidate } = useInvalidator();
  const { track } = useTrack(AnalyticsEvent.CheckIn);
  const { notify } = useActionToast();

  const { nowPlaying } = useNowPlaying();

  if (Array.isArray(props.media)) {
    throw new Error('Cannot check in multiple media items at once.');
  }

  const checkin = async (): Promise<boolean> => {
    if (Array.isArray(props.media)) return false;
    if (type === 'show') {
      throw new Error('Cannot check in a show directly.');
    }

    isCheckingIn.next(true);
    track({ type, action: 'start' });

    try {
      switch (type) {
        case 'episode': {
          const payload = mapToEpisodePayload({
            episode: props.media,
            show: props.show,
          });
          await checkinEpisodeRequest({ body: payload });
          break;
        }
        case 'movie': {
          const payload = mapToMoviePayload(props.media);
          await checkinMovieRequest({ body: payload });
          break;
        }
      }

      await invalidate(InvalidateAction.CheckIn);

      return true;
    } catch {
      notify({ message: m.text_checkin_failed_title(), variant: 'error' });

      return false;
    } finally {
      isCheckingIn.next(false);
    }
  };

  const isWatchable = hasAired({
    ...props.media,
    type,
  });

  return {
    checkin,
    isCheckingIn,
    /*
      FIXME: when we can cancel a checkin, only return true if the
      now playing item is the same as the one we are checking in
    */
    isCheckedIn: nowPlaying.pipe(map(($nowPlaying) => Boolean($nowPlaying))),
    isWatchable,
  };
}
