import type { PersonSummary } from '$lib/requests/models/PersonSummary.ts';
import type { JsonLd } from '../models/SeoMeta.ts';
import { compact } from './_internal/compact.ts';
import { toIsoDate } from './_internal/toIsoDate.ts';

type PersonJsonLdParams = {
  person: PersonSummary;
  description: string;
  url: string;
};

export function toPersonJsonLd(
  { person, description, url }: PersonJsonLdParams,
): JsonLd {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    description,
    url,
    image: person.headshot.url.medium,
    birthDate: toIsoDate(person.birthday),
    deathDate: toIsoDate(person.deathDate),
    sameAs: person.imdb ? [`https://www.imdb.com/name/${person.imdb}/`] : [],
  });
}
