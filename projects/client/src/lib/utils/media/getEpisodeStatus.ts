import {
  EpisodeFinaleType,
  EpisodePremiereType,
  type EpisodeType,
} from '$lib/requests/models/EpisodeType.ts';
import { time } from '$lib/utils/timing/time.ts';

export type EpisodeStatus = 'premiere' | 'finale' | 'new';

type GetEpisodeStatusParams = {
  type: EpisodeType;
  releaseDate?: Date;
  now?: Date;
};

const NEW_EPISODE_WINDOW = time.days(7);

const PREMIERE_TYPES: ReadonlySet<EpisodeType> = new Set(
  Object.values(EpisodePremiereType),
);
const FINALE_TYPES: ReadonlySet<EpisodeType> = new Set(
  Object.values(EpisodeFinaleType),
);

function isRecentlyReleased(releaseDate: Date, now: Date): boolean {
  const elapsed = now.getTime() - releaseDate.getTime();
  return elapsed >= 0 && elapsed <= NEW_EPISODE_WINDOW;
}

export function getEpisodeStatus(
  { type, releaseDate, now = new Date() }: GetEpisodeStatusParams,
): EpisodeStatus | undefined {
  if (PREMIERE_TYPES.has(type)) return 'premiere';
  if (FINALE_TYPES.has(type)) return 'finale';
  if (!releaseDate) return;

  return isRecentlyReleased(releaseDate, now) ? 'new' : undefined;
}
