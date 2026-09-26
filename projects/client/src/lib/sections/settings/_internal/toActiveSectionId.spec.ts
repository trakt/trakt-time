import { describe, expect, it } from 'vitest';
import { toActiveSectionId } from './toActiveSectionId.ts';

const sections = [
  { id: 'appearance', top: 80 },
  { id: 'your-data', top: 420 },
  { id: 'about', top: 1100 },
  { id: 'account', top: 1240 },
];

describe('toActiveSectionId', () => {
  it('picks the last section whose top passed the activation line', () => {
    expect(
      toActiveSectionId({ sections, activationLine: 500, isAtBottom: false }),
    ).toBe('your-data');
  });

  it('falls back to the first section before any has passed the line', () => {
    const below = sections.map((s) => ({ ...s, top: s.top + 1000 }));
    expect(
      toActiveSectionId({
        sections: below,
        activationLine: 200,
        isAtBottom: false,
      }),
    ).toBe('appearance');
  });

  it('picks the last section once the page is scrolled to the bottom', () => {
    expect(
      toActiveSectionId({ sections, activationLine: 500, isAtBottom: true }),
    ).toBe('account');
  });

  it('returns nothing when there are no sections', () => {
    expect(
      toActiveSectionId({
        sections: [],
        activationLine: 500,
        isAtBottom: false,
      }),
    ).toBeUndefined();
  });
});
