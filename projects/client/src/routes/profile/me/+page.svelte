<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
  import { useUser } from '$lib/features/auth/stores/useUser.ts';
  import LoginGate from '$lib/components/auth/LoginGate.svelte';
  import ProfileContent from '$lib/sections/profile/ProfileContent.svelte';

  const { isAuthorized, login } = useAuth();
  const { user } = useUser();

  const slug = $derived($user?.slug ?? $user?.username ?? null);
</script>

<svelte:head>
  <title>{m.page_title_profile()} - Trakt Time</title>
</svelte:head>

<div class="profile-page">
  {#if !$isAuthorized}
    <LoginGate {login} />
  {:else if !slug}
    <div class="loading-state">
      <LoadingIndicator />
    </div>
  {:else}
    <ProfileContent {slug} isOwner={true} />
  {/if}
</div>

<style lang="scss">
  .profile-page {
    display: flex;
    flex-direction: column;
    padding-bottom: var(--trakttime-bottom-nav-height);
  }

  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--gap-xxl) var(--gap-m);
  }
</style>
