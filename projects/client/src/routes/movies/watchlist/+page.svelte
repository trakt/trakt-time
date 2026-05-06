<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
  import LoginGate from '$lib/components/auth/LoginGate.svelte';
  import MoviesWatchlistContent from './_internal/MoviesWatchlistContent.svelte';

  const { isAuthorized, login } = useAuth();
</script>

<svelte:head>
  <title>{m.page_title_movies()} - Trakt Time</title>
</svelte:head>

{#if $isAuthorized}
  <MoviesWatchlistContent />
{:else}
  <LoginGate {login} />
{/if}
