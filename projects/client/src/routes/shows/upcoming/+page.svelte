<script lang="ts">
  import SeoHead from '$lib/features/seo/SeoHead.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
  import LoginGate from '$lib/components/auth/LoginGate.svelte';
  import ShowsUpcomingContent from './_internal/ShowsUpcomingContent.svelte';

  const { isAuthorized, login } = useAuth();
</script>

<SeoHead title={m.page_title_upcoming_shows()} />

{#if $isAuthorized}
  <ShowsUpcomingContent />
{:else}
  <LoginGate {login} />
{/if}
