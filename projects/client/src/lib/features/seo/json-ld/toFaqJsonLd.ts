import type { JsonLd } from '../models/SeoMeta.ts';

export type FaqItem = {
  question: string;
  answer: string;
};

export function toFaqJsonLd(items: ReadonlyArray<FaqItem>): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}
