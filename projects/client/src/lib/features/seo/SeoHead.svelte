<script lang="ts">
  import { page } from '$app/state';
  import * as m from '$lib/paraglide/messages.js';
  import { SITE_NAME } from './constants.ts';
  import type { SeoMeta } from './models/SeoMeta.ts';
  import { toJsonLdScript } from './toJsonLdScript.ts';
  import { toSeoDescription } from './toSeoDescription.ts';
  import { toShareImageUrl } from './toShareImageUrl.ts';

  const {
    title,
    description,
    image,
    imageAlt,
    type = 'website',
    noindex = false,
    canonicalPath,
    jsonLd = [],
  }: SeoMeta = $props();

  const fullTitle = $derived(
    title ? `${title} - ${SITE_NAME}` : m.seo_title_default(),
  );
  const fullDescription = $derived(
    toSeoDescription(description) || m.seo_description_default(),
  );
  const canonicalUrl = $derived(
    `${page.url.origin}${canonicalPath ?? page.url.pathname}`,
  );
  const imageUrl = $derived(
    image ? toShareImageUrl(image) : `${page.url.origin}/og.jpg`,
  );
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={fullDescription} />
  <link rel="canonical" href={canonicalUrl} />
  <meta
    name="robots"
    content={noindex
      ? 'noindex, follow'
      : 'index, follow, max-image-preview:large, max-snippet:-1'}
  />

  <meta property="og:type" content={type} />
  <meta property="og:site_name" content={SITE_NAME} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={fullDescription} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={imageUrl} />
  {#if !image}
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
  {/if}
  <meta property="og:image:alt" content={imageAlt ?? fullTitle} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={fullDescription} />
  <meta name="twitter:image" content={imageUrl} />

  {#each jsonLd as entry, i (i)}
    {@html toJsonLdScript(entry)}
  {/each}
</svelte:head>
