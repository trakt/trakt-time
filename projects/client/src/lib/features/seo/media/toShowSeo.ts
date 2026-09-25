import type { ShowEntry } from '$lib/requests/models/ShowEntry.ts';
import { toShowJsonLd } from '../json-ld/toShowJsonLd.ts';
import type { SeoMeta } from '../models/SeoMeta.ts';
import { toSeoDescription } from '../toSeoDescription.ts';

type ShowSeoParams = {
  show: Nil | ShowEntry;
  title: Nil | string;
  overview: Nil | string;
  url: string;
};

export function toShowSeo(
  { show, title, overview, url }: ShowSeoParams,
): SeoMeta {
  if (!show) return { type: 'video.tv_show' };

  const name = title || show.title;
  const heading = show.year ? `${name} (${show.year})` : name;
  const description = toSeoDescription(overview || show.overview);

  return {
    title: heading,
    description,
    image: show.cover.url.medium,
    imageAlt: name,
    type: 'video.tv_show',
    jsonLd: [toShowJsonLd({ show, title: name, description, url })],
  };
}
