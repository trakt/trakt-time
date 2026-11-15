import { useUser } from '$lib/features/auth/stores/useUser.ts';
import type { MarkAsWatchedStoreProps } from '$lib/sections/media-actions/mark-as-watched/useMarkAsWatched.ts';
import { distinctUntilChanged, map, type Observable, of } from 'rxjs';
import { toWatchProgress } from './toWatchProgress.ts';

export function useWatchProgress(props: MarkAsWatchedStoreProps): {
  progress: Observable<number | undefined>;
} {
  if (props.type !== 'show') {
    return { progress: of(undefined) };
  }

  const shows = Array.isArray(props.media) ? props.media : [props.media];
  const { history } = useUser();

  const progress = history.pipe(
    map(($history) =>
      $history
        ? toWatchProgress(
            shows.map((show) => ({
              playsPerSeason: $history.shows.get(show.id)?.playsPerSeason,
              episodeCount: show.episode?.count,
            })),
          )
        : 0,
    ),
    distinctUntilChanged(),
  );

  return { progress };
}
