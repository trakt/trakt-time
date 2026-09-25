import {
  buildSitemap,
  type SitemapEntry,
} from '$lib/features/seo/sitemap/buildSitemap.ts';
import { COMPETITORS } from '$lib/features/compare/competitors.ts';
import { fetchSitemapSlugs } from '$lib/features/seo/sitemap/fetchSitemapSlugs.ts';
import type { RequestHandler } from '@sveltejs/kit';

const STATIC_ROUTES: ReadonlyArray<SitemapEntry> = [
  { path: '/shows/watchlist', priority: '1.0', changefreq: 'daily' },
  { path: '/discover', priority: '0.9', changefreq: 'daily' },
  { path: '/movies/watchlist', priority: '0.8', changefreq: 'daily' },
  { path: '/trending/shows', priority: '0.8', changefreq: 'hourly' },
  { path: '/trending/movies', priority: '0.8', changefreq: 'hourly' },
  { path: '/popular/shows', priority: '0.8', changefreq: 'daily' },
  { path: '/popular/movies', priority: '0.8', changefreq: 'daily' },
  { path: '/shows/upcoming', priority: '0.6', changefreq: 'daily' },
  { path: '/movies/upcoming', priority: '0.6', changefreq: 'daily' },
  { path: '/compare', priority: '0.7', changefreq: 'monthly' },
  ...COMPETITORS.map(({ slug }): SitemapEntry => ({
    path: `/compare/${slug}`,
    priority: '0.7',
    changefreq: 'monthly',
  })),
];

const toMediaEntries = (
  prefix: '/shows' | '/movies',
  slugs: ReadonlyArray<string>,
): ReadonlyArray<SitemapEntry> =>
  slugs.map((slug) => ({
    path: `${prefix}/${encodeURIComponent(slug)}`,
    priority: '0.7',
    changefreq: 'weekly',
  }));

export const GET: RequestHandler = async ({ url, fetch }) => {
  const lastmod = new Date().toISOString().split('T')[0]!;
  const { shows, movies } = await fetchSitemapSlugs({ fetch });

  const sitemap = buildSitemap({
    origin: url.origin,
    lastmod,
    entries: [
      ...STATIC_ROUTES,
      ...toMediaEntries('/shows', shows),
      ...toMediaEntries('/movies', movies),
    ],
  });

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};
