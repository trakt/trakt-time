import type { MediaTrivia } from '$lib/requests/models/MediaTrivia.ts';
import { describe, expect, it } from 'vitest';
import { toTriviaFacts } from './toTriviaFacts.ts';

const item: MediaTrivia = {
  key: 'movie_trivia_1_0',
  text: 'Shot in twelve days.',
  isSpoiler: false,
  category: 'bts',
};

describe('toTriviaFacts', () => {
  it('returns the full items when there are any', () => {
    expect(toTriviaFacts({ items: [item], summary: ['Quick fact.'] }))
      .toEqual([item]);
  });

  it('falls back to uncategorized summary facts when items are empty', () => {
    expect(toTriviaFacts({ items: [], summary: ['First.', 'Second.'] }))
      .toEqual([
        { key: 'summary_0', text: 'First.', isSpoiler: false, category: null },
        { key: 'summary_1', text: 'Second.', isSpoiler: false, category: null },
      ]);
  });

  it('returns nothing when both are empty', () => {
    expect(toTriviaFacts({ items: [], summary: [] })).toEqual([]);
  });
});
