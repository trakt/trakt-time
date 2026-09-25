import type { PersonSummary } from '$lib/requests/models/PersonSummary.ts';
import { toPersonJsonLd } from '../json-ld/toPersonJsonLd.ts';
import type { SeoMeta } from '../models/SeoMeta.ts';
import { toSeoDescription } from '../toSeoDescription.ts';

type PersonSeoParams = {
  person: Nil | PersonSummary;
  url: string;
};

export function toPersonSeo({ person, url }: PersonSeoParams): SeoMeta {
  if (!person) return { type: 'profile' };

  const description = toSeoDescription(person.biography);

  return {
    title: person.name,
    description,
    image: person.headshot.url.medium,
    imageAlt: person.name,
    type: 'profile',
    jsonLd: [toPersonJsonLd({ person, description, url })],
  };
}
