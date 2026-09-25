import { SITE_NAME } from '../constants.ts';
import type { JsonLd } from '../models/SeoMeta.ts';

type SiteJsonLdParams = {
  origin: string;
  description: string;
};

export function toSiteJsonLd(
  { origin, description }: SiteJsonLdParams,
): ReadonlyArray<JsonLd> {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: `${origin}/`,
      description,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: SITE_NAME,
      url: `${origin}/`,
      description,
      applicationCategory: 'EntertainmentApplication',
      operatingSystem: 'Web, iOS, Android',
      browserRequirements: 'Requires JavaScript',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Trakt',
        url: 'https://trakt.tv',
      },
    },
  ];
}
