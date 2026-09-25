<script lang="ts">
  import { page } from '$app/state';
  import SeoHead from '$lib/features/seo/SeoHead.svelte';
  import { toSiteJsonLd } from '$lib/features/seo/json-ld/toSiteJsonLd.ts';
  import * as m from '$lib/paraglide/messages.js';
  import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
  import LoginGate from '$lib/components/auth/LoginGate.svelte';
  import ShowsWatchlistContent from './_internal/ShowsWatchlistContent.svelte';

  const { isAuthorized, login } = useAuth();
</script>

<SeoHead
  jsonLd={toSiteJsonLd({
    origin: page.url.origin,
    description: m.seo_description_default(),
  })}
/>

{#if $isAuthorized}
  <ShowsWatchlistContent />
{:else}
  <LoginGate {login} />
{/if}
