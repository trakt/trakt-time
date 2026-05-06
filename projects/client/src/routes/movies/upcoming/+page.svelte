<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
  import LoginGate from '$lib/components/auth/LoginGate.svelte';
  import MoviesUpcomingContent from './_internal/MoviesUpcomingContent.svelte';

  const { isAuthorized, login } = useAuth();
</script>

<svelte:head>
  <title>{m.page_title_upcoming_movies()} - Trakt Time</title>
</svelte:head>

{#if $isAuthorized}
  <MoviesUpcomingContent />
{:else}
  <LoginGate {login} />
{/if}
