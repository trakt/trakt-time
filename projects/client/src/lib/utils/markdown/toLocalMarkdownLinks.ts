import { UrlBuilder } from '../url/UrlBuilder.ts';

const MARKDOWN_LINK = /\[([^\]\n]+)\]\(([^)\s]+)\)/g;
const TRAKT_HOSTS = new Set(['trakt.tv', 'www.trakt.tv', 'app.trakt.tv']);

const LOCAL_ROUTES: Record<string, (slug: string) => string> = {
  people: (slug) => UrlBuilder.people(slug),
  shows: (slug) => UrlBuilder.show(slug),
  movies: (slug) => UrlBuilder.movie(slug),
};

function toLocalPath(href: string): string | null | undefined {
  const url = URL.parse(href);
  if (!url || !TRAKT_HOSTS.has(url.hostname)) return undefined;

  const [kind, slug, ...rest] = url.pathname.split('/').filter(Boolean);
  if (!kind || !slug || rest.length > 0) return null;

  return LOCAL_ROUTES[kind]?.(slug) ?? null;
}

export function toLocalMarkdownLinks(text: string): string {
  return text.replace(MARKDOWN_LINK, (link, label: string, href: string) => {
    const path = toLocalPath(href);

    if (path === undefined) return link;
    if (path === null) return label;

    return `[${label}](${path})`;
  });
}
