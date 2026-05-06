<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
  import LoginGate from '$lib/components/auth/LoginGate.svelte';
  import ShowsWatchlistContent from './_internal/ShowsWatchlistContent.svelte';

  const { isAuthorized, login } = useAuth();
</script>

<svelte:head>
  <title>{m.page_title_shows()} - Trakt Time</title>
</svelte:head>

{#if $isAuthorized}
  <ShowsWatchlistContent />
{:else}
  <LoginGate {login} />
{/if}
