import { beforeEach, describe, expect, it } from 'vitest';
import { removeUnclaimedHeadNodes } from './removeUnclaimedHeadNodes.ts';

describe('removeUnclaimedHeadNodes', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('should remove server rendered blocks that were never hydrated', () => {
    document.head.innerHTML = [
      '<!-- CSP -->',
      '<meta name="viewport" content="width=device-width">',
      '<!--14r2ons--><meta name="theme-color"><!---->',
      '<meta name="theme-color" content="#0c0b0b">',
    ].join('');

    removeUnclaimedHeadNodes(document.head);

    expect(document.head.querySelectorAll('meta[name="theme-color"]'))
      .toHaveLength(1);
    expect(
      document.head.querySelector('meta[name="theme-color"]')
        ?.getAttribute('content'),
    ).toBe('#0c0b0b');
    expect(document.head.querySelector('meta[name="viewport"]')).not.toBeNull();
  });

  it('should remove nested control flow inside a stale block', () => {
    document.head.innerHTML = [
      '<!--1r0dd2y--><meta name="description" content="stale">',
      '<!--[0--><meta property="og:image:width" content="1200"><!--]-->',
      '<meta property="og:title" content="stale"><!---->',
      '<link rel="canonical" href="https://tvtime.trakt.tv/discover">',
    ].join('');

    removeUnclaimedHeadNodes(document.head);

    expect(document.head.querySelector('meta[name="description"]')).toBeNull();
    expect(document.head.querySelector('meta[property="og:title"]')).toBeNull();
    expect(document.head.querySelector('link[rel="canonical"]')).not.toBeNull();
  });

  it('should keep hand written comments and hydrated nodes', () => {
    document.head.innerHTML =
      '<!-- PWA --><link rel="manifest" href="/manifest.webmanifest">';

    removeUnclaimedHeadNodes(document.head);

    expect(document.head.childNodes).toHaveLength(2);
  });
});
