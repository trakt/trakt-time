import { describe, expect, it } from 'vitest';
import { toMediaDetails } from './toMediaDetails.ts';

const base = {
  locale: 'en' as const,
  language: 'en' as const,
};

describe('toMediaDetails', () => {
  it('lists network, release date, runtime, country and language in order', () => {
    const details = toMediaDetails({
      ...base,
      media: { runtime: 55, country: 'us', languages: ['en', 'fr'] },
      releaseDate: new Date(2022, 1, 18),
      network: 'Apple TV',
    });

    expect(details.map((d) => d.label)).toEqual([
      'Network',
      'Release date',
      'Runtime',
      'Country',
      'Language',
    ]);
    expect(details.map((d) => d.value)).toEqual([
      'Apple TV',
      'Feb 18, 2022',
      '55m',
      'United States',
      'English',
    ]);
  });

  it('skips details that are missing', () => {
    const details = toMediaDetails({
      ...base,
      media: { runtime: 0, country: null, languages: [] },
      releaseDate: null,
    });

    expect(details).toEqual([]);
  });

  it('formats long runtimes in hours and minutes', () => {
    const [runtime] = toMediaDetails({
      ...base,
      media: { runtime: 166, country: null, languages: null },
      releaseDate: null,
    });

    expect(runtime?.value).toBe('2h 46m');
  });

  describe('ending', () => {
    const withEnding = (ending: 'concluded' | 'open' | null | undefined) =>
      toMediaDetails({
        ...base,
        media: { runtime: 55, country: null, languages: null },
        releaseDate: new Date(2022, 1, 18),
        ending,
      });

    it('shows Complete for a concluded show after the release date', () => {
      const details = withEnding('concluded');

      expect(details.map((d) => d.label)).toEqual([
        'Release date',
        'Ending',
        'Runtime',
      ]);
      expect(details.find((d) => d.label === 'Ending')?.value).toBe('Complete');
    });

    it('shows Unresolved for an open show', () => {
      expect(withEnding('open').find((d) => d.label === 'Ending')?.value).toBe(
        'Unresolved',
      );
    });

    it('hides the row when the ending is null or missing', () => {
      expect(withEnding(null).map((d) => d.label)).not.toContain('Ending');
      expect(withEnding(undefined).map((d) => d.label)).not.toContain('Ending');
    });
  });
});
