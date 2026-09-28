import { describe, expect, it } from 'vitest';
import { toLinkParts } from './toLinkParts.ts';

describe('toLinkParts', () => {
  it('splits the text around the link label', () => {
    expect(toLinkParts('Visit your <a>watchlist</a> now')).toEqual({
      before: 'Visit your ',
      label: 'watchlist',
      after: ' now',
    });
  });

  it('returns the whole text when there is no link', () => {
    expect(toLinkParts('Click on Export')).toEqual({
      before: 'Click on Export',
      label: null,
      after: '',
    });
  });
});
