import { describe, expect, it } from 'vitest';
import { toShareImageUrl } from './toShareImageUrl.ts';

describe('toShareImageUrl', () => {
  it('should swap the webp rendition for the original jpeg', () => {
    expect(
      toShareImageUrl(
        'https://media.trakt.tv/images/fanarts/medium/a.jpg.webp',
      ),
    ).toBe('https://media.trakt.tv/images/fanarts/medium/a.jpg');
  });

  it('should keep urls that are already share friendly', () => {
    expect(toShareImageUrl('https://tvtime.trakt.tv/og.jpg')).toBe(
      'https://tvtime.trakt.tv/og.jpg',
    );
  });

  it('should keep standalone webp files untouched', () => {
    expect(toShareImageUrl('https://example.com/a.webp')).toBe(
      'https://example.com/a.webp',
    );
  });
});
