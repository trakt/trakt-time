import { describe, expect, it } from 'vitest';
import { bucketFor, ratingDelight, shouldFire } from './delightRules.ts';

describe('ratingDelight', () => {
  it('celebrates a 10', () => {
    expect(ratingDelight(10)).toBe('rating-high');
  });

  it('reacts to a 1 or a 2', () => {
    expect(ratingDelight(1)).toBe('rating-low');
    expect(ratingDelight(2)).toBe('rating-low');
  });

  it('stays quiet for everything in between and for a cleared rating', () => {
    [0, 3, 5, 6, 9].forEach((rating) => {
      expect(ratingDelight(rating)).toBeNull();
    });
  });
});

describe('shouldFire', () => {
  it('always fires without a once key', () => {
    expect(shouldFire({ fired: new Set(['finale:1']) })).toBe(true);
  });

  it('fires a once key only the first time', () => {
    expect(shouldFire({ onceKey: 'finale:1', fired: new Set() })).toBe(true);
    expect(shouldFire({ onceKey: 'finale:1', fired: new Set(['finale:1']) }))
      .toBe(false);
  });
});

describe('bucketFor', () => {
  const variants = ['tomato', 'rain'] as const;

  it('keeps a user in the same group', () => {
    const first = bucketFor({ seed: 'sean', experiment: 'low', variants });
    const second = bucketFor({ seed: 'sean', experiment: 'low', variants });

    expect(first).toBe(second);
  });

  it('spreads users across every variant', () => {
    const seen = new Set(
      Array.from(
        { length: 200 },
        (_, i) => bucketFor({ seed: `user-${i}`, experiment: 'low', variants }),
      ),
    );

    expect(seen).toEqual(new Set(variants));
  });
});
