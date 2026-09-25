import type {
  MediaTrivia,
  TriviaCategory,
} from '$lib/requests/models/MediaTrivia.ts';

export type TriviaFact = Pick<MediaTrivia, 'key' | 'text' | 'isSpoiler'> & {
  category: TriviaCategory | null;
};

type ToTriviaFactsParams = {
  items: ReadonlyArray<MediaTrivia>;
  summary: ReadonlyArray<string>;
};

export function toTriviaFacts(
  { items, summary }: ToTriviaFactsParams,
): ReadonlyArray<TriviaFact> {
  if (items.length > 0) return items;

  return summary.map((text, index) => ({
    key: `summary_${index}`,
    text,
    isSpoiler: false,
    category: null,
  }));
}
