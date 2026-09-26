import { describe, expect, it } from 'vitest';
import { toDiscoverSearchUrl } from './discoverSearchUrl.ts';

describe('toDiscoverSearchUrl', () => {
  it('returns the bare discover route for an empty term', () => {
    expect(toDiscoverSearchUrl('')).toBe('/discover');
  });

  it('returns the bare discover route for whitespace', () => {
    expect(toDiscoverSearchUrl('   ')).toBe('/discover');
  });

  it('encodes the term into the q parameter', () => {
    expect(toDiscoverSearchUrl('slow horses & co')).toBe(
      '/discover?q=slow+horses+%26+co',
    );
  });

  it('keeps inner whitespace the user is still typing', () => {
    expect(toDiscoverSearchUrl('dune ')).toBe('/discover?q=dune+');
  });
});
