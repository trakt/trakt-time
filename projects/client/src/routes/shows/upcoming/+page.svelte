<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
  import LoginGate from '$lib/components/auth/LoginGate.svelte';
  import ShowsUpcomingContent from './_internal/ShowsUpcomingContent.svelte';

  const { isAuthorized, login } = useAuth();
</script>

<svelte:head>
  <title>{m.page_title_upcoming_shows()} - Trakt Time</title>
</svelte:head>

{#if $isAuthorized}
  <ShowsUpcomingContent />
{:else}
  <LoginGate {login} />
{/if}
