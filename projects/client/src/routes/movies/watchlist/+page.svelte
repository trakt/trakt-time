<script lang="ts">
  import SeoHead from '$lib/features/seo/SeoHead.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
  import LoginGate from '$lib/components/auth/LoginGate.svelte';
  import MoviesWatchlistContent from './_internal/MoviesWatchlistContent.svelte';

  const { isAuthorized, login } = useAuth();
</script>

<SeoHead title={m.page_title_movies()} />

{#if $isAuthorized}
  <MoviesWatchlistContent />
{:else}
  <LoginGate {login} />
{/if}
