<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import Appearance from '$lib/sections/settings/_internal/Appearance.svelte';
  import VipSettings from '$lib/sections/settings/_internal/VipSettings.svelte';
  import TvTimeImport from '$lib/sections/settings/_internal/import/TvTimeImport.svelte';
  import LogoutButton from '$lib/components/buttons/logout/LogoutButton.svelte';
  import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
  import LoginGate from '$lib/components/auth/LoginGate.svelte';
  import BackBar from '$lib/components/back-bar/BackBar.svelte';

  const { isAuthorized, login } = useAuth();
</script>

<svelte:head>
  <title>{m.page_title_settings()} - Trakt Time</title>
</svelte:head>

<div class="settings-page">
  <BackBar href="/profile" label={m.page_title_settings()} />

  {#if !$isAuthorized}
    <LoginGate {login} />
  {:else}
    <Appearance />
    <VipSettings />
    <TvTimeImport />
    <div class="settings-logout">
      <LogoutButton />
    </div>
  {/if}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .settings-page {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xl);
    padding: var(--ni-72) var(--gap-m) var(--trakttime-bottom-nav-height);
  }

  .settings-logout {
    display: flex;
  }
</style>
