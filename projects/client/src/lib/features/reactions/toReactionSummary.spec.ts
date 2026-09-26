import { describe, expect, it } from 'vitest';
import { toReactionSummary } from './toReactionSummary.ts';

describe('toReactionSummary', () => {
  it('returns nothing without a summary', () => {
    expect(toReactionSummary(null)).toEqual([]);
  });

  it('keeps the top three non-zero reactions, most used first', () => {
    const summary = {
      count: 20,
      distribution: {
        like: 4,
        dislike: 0,
        love: 9,
        laugh: 1,
        shocked: 5,
        bravo: 1,
        spoiler: 0,
      },
    };

    expect(toReactionSummary(summary)).toEqual([
      { reaction: 'love', count: 9 },
      { reaction: 'shocked', count: 5 },
      { reaction: 'like', count: 4 },
    ]);
  });
});
