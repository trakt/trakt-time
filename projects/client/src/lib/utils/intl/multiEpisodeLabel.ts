import * as m from '$lib/features/i18n/messages.ts';
import type { EpisodeEntry } from '../../requests/models/EpisodeEntry.ts';
import { seasonLabel } from './seasonLabel.ts';

export function multiEpisodeLabel(
  episodes: EpisodeEntry[],
  season: number,
  showTitle?: string,
): string {
  const isSequential = episodes.length > 0 &&
    episodes.every((ep, idx) => {
      if (idx === 0) return true;
      return ep.number === (episodes.at(idx - 1)?.number ?? 0) + 1;
    });

  if (isSequential) {
    const start = episodes.at(0)?.number ?? 0;
    const end = episodes.at(-1)?.number ?? 0;

    // A degenerate single-episode "range" reads as E5-5; use the plain
    // episode label instead.
    const rangeLabel = start === end
      ? m.episode_footer_season_episode({
        seasonNumber: season,
        episodeNumber: start,
      })
      : m.episode_footer_season_episode_range({
        seasonNumber: season,
        startEpisode: start,
        endEpisode: end,
      });

    return showTitle
      ? m.text_season_activity({ rangeLabel, title: showTitle })
      : rangeLabel;
  }

  return m.text_season_activity({
    rangeLabel: m.tag_text_number_of_episodes({ count: episodes.length }),
    title: showTitle ?? seasonLabel(season),
  });
}
