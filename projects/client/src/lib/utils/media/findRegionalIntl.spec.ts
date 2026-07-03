import { describe, expect, it } from 'vitest';
import { findRegionalIntl } from './findRegionalIntl.ts';

// The default test locale is `en`, which resolves to the `us` region.
describe('findRegionalIntl', () => {
  it('picks the translation matching the active region', () => {
    const intl = findRegionalIntl({
      type: 'show',
      translations: [
        { title: 'Le Fil', overview: 'FR overview', country: 'fr' },
        { title: 'The Wire', overview: 'US overview', country: 'us' },
      ],
    });

    expect(intl).toEqual({
      title: 'The Wire',
      overview: 'US overview',
      country: 'us',
      tagline: '',
    });
  });

  it('includes the regional tagline for media', () => {
    const intl = findRegionalIntl({
      type: 'movie',
      translations: [
        {
          title: 'Heat',
          overview: 'US overview',
          tagline: 'A crime saga.',
          country: 'us',
        },
      ],
    });

    expect(intl).toEqual({
      title: 'Heat',
      overview: 'US overview',
      country: 'us',
      tagline: 'A crime saga.',
    });
  });

  it('omits the tagline for episodes', () => {
    const intl = findRegionalIntl({
      type: 'episode',
      translations: [
        { title: 'Middle Ground', overview: 'US overview', country: 'us' },
      ],
    });

    expect(intl).toEqual({
      title: 'Middle Ground',
      overview: 'US overview',
      country: 'us',
    });
  });

  it('falls back when no translation matches the region', () => {
    const intl = findRegionalIntl({
      type: 'show',
      translations: [
        { title: 'Le Fil', overview: 'FR overview', country: 'fr' },
      ],
      fallback: {
        title: 'The Wire',
        overview: 'Fallback overview',
        tagline: 'Fallback tagline',
      },
    });

    expect(intl).toEqual({
      title: 'The Wire',
      overview: 'Fallback overview',
      country: '',
      tagline: 'Fallback tagline',
    });
  });

  it('falls back per field when the translation is partial', () => {
    const intl = findRegionalIntl({
      type: 'show',
      translations: [
        { title: null, overview: 'US overview', country: 'us' },
      ],
      fallback: {
        title: 'The Wire',
        overview: 'Fallback overview',
        tagline: '',
      },
    });

    expect(intl.title).toBe('The Wire');
    expect(intl.overview).toBe('US overview');
  });

  it('returns empty strings without translations or fallback', () => {
    expect(findRegionalIntl({ type: 'show' })).toEqual({
      title: '',
      overview: '',
      country: '',
      tagline: '',
    });
  });
});
