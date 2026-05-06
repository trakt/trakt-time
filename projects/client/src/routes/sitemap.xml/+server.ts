import type { RequestHandler } from '@sveltejs/kit';

type SitemapEntry = {
  path: string;
  priority: string;
  changefreq:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
};

const STATIC_ROUTES: ReadonlyArray<SitemapEntry> = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/discover', priority: '0.9', changefreq: 'daily' },
  { path: '/movies', priority: '0.9', changefreq: 'daily' },
  { path: '/movies/popular', priority: '0.8', changefreq: 'daily' },
  { path: '/movies/trending', priority: '0.8', changefreq: 'hourly' },
  { path: '/movies/recommended', priority: '0.7', changefreq: 'daily' },
  { path: '/movies/upcoming', priority: '0.7', changefreq: 'weekly' },
  { path: '/shows', priority: '0.9', changefreq: 'daily' },
  { path: '/shows/popular', priority: '0.8', changefreq: 'daily' },
  { path: '/shows/trending', priority: '0.8', changefreq: 'hourly' },
  { path: '/shows/recommended', priority: '0.7', changefreq: 'daily' },
  { path: '/shows/upcoming', priority: '0.7', changefreq: 'weekly' },
];

const buildUrl = (
  origin: string,
  { path, priority, changefreq }: SitemapEntry,
  lastmod: string,
) =>
  `  <url>
    <loc>${origin}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

const buildSitemap = (origin: string, lastmod: string) => {
  const urls = STATIC_ROUTES.map((entry) => buildUrl(origin, entry, lastmod))
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
};

export const GET: RequestHandler = ({ url }) => {
  const lastmod = new Date().toISOString().split('T')[0]!;

  return new Response(buildSitemap(url.origin, lastmod), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};
