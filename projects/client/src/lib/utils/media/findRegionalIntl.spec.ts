import { setLocale } from '$lib/features/i18n/index.ts';
import { afterEach, describe, expect, it } from 'vitest';
import { findRegionalIntl } from './findRegionalIntl.ts';

// The default test locale is `en`, which resolves to the `us` region.
describe('findRegionalIntl', () => {
  afterEach(() => {
    setLocale('en');
  });

  it('picks the translation matching the active region', () => {
    const intl = findRegionalIntl({
      type: 'show',
      translations: [
        {
          title: 'Le Fil',
          overview: 'FR overview',
          country: 'fr',
          language: 'fr',
        },
        {
          title: 'The Wire',
          overview: 'US overview',
          country: 'us',
          language: 'en',
        },
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
          language: 'en',
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
        {
          title: 'Middle Ground',
          overview: 'US overview',
          country: 'us',
          language: 'en',
        },
      ],
    });

    expect(intl).toEqual({
      title: 'Middle Ground',
      overview: 'US overview',
      country: 'us',
    });
  });

  it('falls back when no translation matches the region or language', () => {
    const intl = findRegionalIntl({
      type: 'show',
      translations: [
        {
          title: 'Le Fil',
          overview: 'FR overview',
          country: 'fr',
          language: 'fr',
        },
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
        { title: null, overview: 'US overview', country: 'us', language: 'en' },
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

  it('borrows a null field from a same-language sibling translation', () => {
    setLocale('es-es');

    const intl = findRegionalIntl({
      type: 'movie',
      translations: [
        {
          title: 'Sunshine: Alerta solar',
          overview: 'Spanish (MX) overview.',
          tagline: 'Si el sol muere, nosotros también.',
          country: 'mx',
          language: 'es',
        },
        {
          title: null,
          overview: 'Spanish (ES) overview.',
          tagline: null,
          country: 'es',
          language: 'es',
        },
      ],
      fallback: {
        title: 'Sunshine',
        overview: 'English overview.',
        tagline: 'If the sun dies, so do we.',
      },
    });

    expect(intl).toEqual({
      title: 'Sunshine: Alerta solar',
      overview: 'Spanish (ES) overview.',
      tagline: 'Si el sol muere, nosotros también.',
      country: 'es',
    });
  });

  it('borrows a same-language sibling for episodes without a regional match', () => {
    setLocale('es-es');

    const intl = findRegionalIntl({
      type: 'episode',
      translations: [
        {
          title: 'Terreno intermedio',
          overview: 'Spanish (MX) overview.',
          country: 'mx',
          language: 'es',
        },
      ],
      fallback: {
        title: 'Middle Ground',
        overview: 'English overview.',
      },
    });

    expect(intl).toEqual({
      title: 'Terreno intermedio',
      overview: 'Spanish (MX) overview.',
      country: '',
    });
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
