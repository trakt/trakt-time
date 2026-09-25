import type { JsonLd } from './models/SeoMeta.ts';

export function toJsonLdScript(data: JsonLd): string {
  const json = JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  return `<script type="application/ld+json">${json}</script>`;
}
