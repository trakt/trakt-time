import { useActionToast } from '$lib/features/action-toast/useActionToast.ts';
import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
import * as m from '$lib/paraglide/messages.js';
import type { EpisodeEntry } from '$lib/requests/models/EpisodeEntry.ts';
import type { Season } from '$lib/requests/models/Season.ts';
import { time } from '$lib/utils/timing/time.ts';
import { useShowEpisodeHistory } from '../_internal/useShowEpisodeHistory.ts';
import {
  countSkippedEpisodes,
  findSkippedEpisodeIds,
} from './findSkippedEpisodes.ts';

type UseWatchedUntilHereProps = {
  slug: string;
  showId: number;
};

type OfferParams = {
  episode: EpisodeEntry;
  currentSeasonEpisodes: ReadonlyArray<EpisodeEntry>;
  seasons: ReadonlyArray<Season>;
};

type EpisodeTarget = {
  season: number;
  number: number;
};

const OFFER_DURATION = time.seconds(10);

export function useWatchedUntilHere(props: UseWatchedUntilHereProps) {
  const { notify, dismiss } = useActionToast();
  const { isAuthorized } = useAuth();
  const { resolveWatched, fetchSeasonEpisodes, markEpisodesAsWatched } =
    useShowEpisodeHistory(props);

  const fillSkipped = async (target: EpisodeTarget) => {
    const seasonNumbers = Array.from(
      { length: target.season },
      (_, index) => index + 1,
    );
    const episodesBySeason = new Map(
      await Promise.all(
        seasonNumbers.map(
          async (season) =>
            [season, await fetchSeasonEpisodes(season)] as const,
        ),
      ),
    );
    const { watchedEpisodeIds } = await resolveWatched();

    await markEpisodesAsWatched({
      ids: findSkippedEpisodeIds({
        target,
        episodesBySeason,
        watchedEpisodeIds,
      }),
      watchedAt: 'released',
    });
  };

  let offerId: string | null = null;
  let isDisposed = false;

  const offerWatchedUntilHere = async ({
    episode,
    currentSeasonEpisodes,
    seasons,
  }: OfferParams) => {
    if (!isAuthorized.value) return;

    const target = { season: episode.season, number: episode.number };
    const skippedCount = countSkippedEpisodes({
      target,
      currentSeasonEpisodes,
      previousSeasons: seasons,
      ...(await resolveWatched()),
    });

    if (skippedCount === 0 || isDisposed) return;

    offerId = notify({
      message: m.confirmation_title_watched_until_here(),
      durationMs: OFFER_DURATION,
      action: {
        text: m.button_text_watched_until_here(),
        label: m.button_label_watched_until_here({ title: episode.title }),
        onAction: () => fillSkipped(target),
      },
    });
  };

  const dispose = () => {
    isDisposed = true;
    if (offerId) dismiss(offerId);
  };

  return { offerWatchedUntilHere, dispose };
}
