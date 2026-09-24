import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
import { ConfirmationType } from '$lib/features/confirmation/models/ConfirmationType.ts';
import { useConfirm } from '$lib/features/confirmation/useConfirm.ts';
import type { EpisodeEntry } from '$lib/requests/models/EpisodeEntry.ts';
import type { Season } from '$lib/requests/models/Season.ts';
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

export function useWatchedUntilHere(props: UseWatchedUntilHereProps) {
  const { confirm } = useConfirm();
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
        seasonNumbers.map(async (season) =>
          [season, await fetchSeasonEpisodes(season)] as const
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

  const offerWatchedUntilHere = async (
    { episode, currentSeasonEpisodes, seasons }: OfferParams,
  ) => {
    if (!isAuthorized.value) return;

    const target = { season: episode.season, number: episode.number };
    const skippedCount = countSkippedEpisodes({
      target,
      currentSeasonEpisodes,
      previousSeasons: seasons,
      ...(await resolveWatched()),
    });

    if (skippedCount === 0) return;

    confirm({
      type: ConfirmationType.WatchedUntilHere,
      title: episode.title,
      onConfirm: () => fillSkipped(target),
    })();
  };

  return { offerWatchedUntilHere };
}
