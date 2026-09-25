import type { EpisodeEntry } from '$lib/requests/models/EpisodeEntry.ts';
import type { ShowEntry } from '$lib/requests/models/ShowEntry.ts';
import { toEpisodeJsonLd } from '../json-ld/toEpisodeJsonLd.ts';
import type { SeoMeta } from '../models/SeoMeta.ts';
import { toSeoDescription } from '../toSeoDescription.ts';

type EpisodeSeoParams = {
  episode: Nil | EpisodeEntry;
  show: Nil | ShowEntry;
  title: Nil | string;
  overview: Nil | string;
  url: string;
  showUrl: string;
};

function toEpisodeCode(episode: EpisodeEntry) {
  const season = episode.season.toString().padStart(2, '0');
  const number = episode.number.toString().padStart(2, '0');
  return `S${season}E${number}`;
}

export function toEpisodeSeo(
  { episode, show, title, overview, url, showUrl }: EpisodeSeoParams,
): SeoMeta {
  if (!episode) return { type: 'video.episode' };

  const name = title || episode.title;
  const code = toEpisodeCode(episode);
  const heading = show ? `${show.title} ${code}: ${name}` : `${code}: ${name}`;
  const description = toSeoDescription(overview || episode.overview);

  return {
    title: heading,
    description,
    image: episode.cover.url ?? show?.cover.url.medium,
    imageAlt: heading,
    type: 'video.episode',
    jsonLd: [
      toEpisodeJsonLd({
        episode,
        show,
        title: name,
        description,
        url,
        showUrl,
      }),
    ],
  };
}
