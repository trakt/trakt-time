import type { EpisodeEntry } from '$lib/requests/models/EpisodeEntry.ts';
import { describe, expect, it } from 'vitest';
import { multiEpisodeLabel } from './multiEpisodeLabel.ts';

function episode(number: number): EpisodeEntry {
  return { number } as EpisodeEntry;
}

describe('multiEpisodeLabel', () => {
  it('labels a sequential run as an episode range', () => {
    expect(multiEpisodeLabel([episode(2), episode(3), episode(4)], 1)).toBe(
      'S1 • E2-4',
    );
  });

  it('appends the show title to a sequential run', () => {
    expect(
      multiEpisodeLabel([episode(1), episode(2)], 3, 'The Wire'),
    ).toBe('S3 • E1-2 of The Wire');
  });

  it('labels a single episode without a degenerate range', () => {
    expect(multiEpisodeLabel([episode(5)], 1)).toBe('S1 • E5');
  });

  it('falls back to an episode count for non sequential runs', () => {
    expect(
      multiEpisodeLabel(
        [episode(1), episode(3), episode(7)],
        1,
        'The Wire',
      ),
    ).toBe('3 eps. of The Wire');
  });

  it('uses the season label when there is no show title', () => {
    expect(multiEpisodeLabel([episode(1), episode(4)], 2)).toBe(
      '2 eps. of Season 2',
    );
  });

  it('uses the specials label for season zero', () => {
    expect(multiEpisodeLabel([episode(1), episode(4)], 0)).toBe(
      '2 eps. of Specials',
    );
  });
});
