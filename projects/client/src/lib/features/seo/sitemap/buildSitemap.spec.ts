import { describe, expect, it } from 'vitest';
import { buildSitemap } from './buildSitemap.ts';

describe('buildSitemap', () => {
  const origin = 'https://tvtime.trakt.tv';
  const lastmod = '2026-09-25';

  it('should build one url entry per path', () => {
    const xml = buildSitemap({
      origin,
      lastmod,
      entries: [
        { path: '/discover', priority: '0.9', changefreq: 'daily' },
        { path: '/shows/severance', priority: '0.7', changefreq: 'weekly' },
      ],
    });

    expect(xml).toContain('<loc>https://tvtime.trakt.tv/discover</loc>');
    expect(xml).toContain('<loc>https://tvtime.trakt.tv/shows/severance</loc>');
    expect(xml.match(/<url>/g)).toHaveLength(2);
  });

  it('should drop duplicate paths', () => {
    const entry = {
      path: '/shows/severance',
      priority: '0.7',
      changefreq: 'weekly',
    } as const;
    const xml = buildSitemap({ origin, lastmod, entries: [entry, entry] });

    expect(xml.match(/<url>/g)).toHaveLength(1);
  });

  it('should escape XML special characters', () => {
    const xml = buildSitemap({
      origin,
      lastmod,
      entries: [{ path: '/shows/a&b', priority: '0.7', changefreq: 'weekly' }],
    });

    expect(xml).toContain('/shows/a&amp;b');
  });
});
