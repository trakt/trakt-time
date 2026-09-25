import type { RequestHandler } from '@sveltejs/kit';

const DISALLOWED_PATHS = [
  '/settings',
  '/vip',
  '/profile/me',
  '/recommended',
  '/lists/',
  '/callback',
  '/silent-redirect',
  '/api/',
];

export const GET: RequestHandler = ({ url }) => {
  const rules = DISALLOWED_PATHS.map((path) => `Disallow: ${path}`).join('\n');
  const body = `User-agent: *
Allow: /
${rules}

Sitemap: ${url.origin}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
};
