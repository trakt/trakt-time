export type SitemapEntry = {
  path: string;
  priority: string;
  changefreq: 'hourly' | 'daily' | 'weekly' | 'monthly';
};

type BuildSitemapParams = {
  origin: string;
  lastmod: string;
  entries: ReadonlyArray<SitemapEntry>;
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toUrl = (
  { origin, lastmod }: Omit<BuildSitemapParams, 'entries'>,
  { path, priority, changefreq }: SitemapEntry,
) =>
  `  <url>
    <loc>${escapeXml(`${origin}${path}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

export function buildSitemap(
  { origin, lastmod, entries }: BuildSitemapParams,
): string {
  const unique = [...new Map(entries.map((entry) => [entry.path, entry]))
    .values()];
  const urls = unique.map((entry) => toUrl({ origin, lastmod }, entry)).join(
    '\n',
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}
