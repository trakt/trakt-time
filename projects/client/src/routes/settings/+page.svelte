<script lang="ts">
  import SeoHead from '$lib/features/seo/SeoHead.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import AccountCard from '$lib/sections/settings/_internal/AccountCard.svelte';
  import Appearance from '$lib/sections/settings/_internal/Appearance.svelte';
  import SettingsBlock from '$lib/sections/settings/_internal/SettingsBlock.svelte';
  import SettingsRow from '$lib/sections/settings/_internal/SettingsRow.svelte';
  import VipSettings from '$lib/sections/settings/_internal/VipSettings.svelte';
  import TvTimeImport from '$lib/sections/settings/_internal/import/TvTimeImport.svelte';
  import LogoutButton from '$lib/components/buttons/logout/LogoutButton.svelte';
  import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
  import LoginGate from '$lib/components/auth/LoginGate.svelte';
  import BackBar from '$lib/components/back-bar/BackBar.svelte';
  import ChevronRightIcon from '$lib/components/icons/ChevronRightIcon.svelte';
  import QuestionIcon from '$lib/components/icons/QuestionIcon.svelte';

  const { isAuthorized, login } = useAuth();
</script>

<SeoHead title={m.page_title_settings()} noindex />

<div class="settings-page">
  <BackBar href="/profile" label={m.page_title_settings()} />

  {#if !$isAuthorized}
    <LoginGate {login} />
  {:else}
    <AccountCard />
    <VipSettings />
    <Appearance />
    <TvTimeImport />
    <SettingsBlock title={m.header_about()}>
      <SettingsRow
        href="/compare"
        title={m.compare_index_title()}
        subtitle={m.compare_settings_hint()}
        tone="blue"
      >
        {#snippet icon()}
          <QuestionIcon />
        {/snippet}
        <ChevronRightIcon />
      </SettingsRow>
    </SettingsBlock>
    <SettingsBlock title={m.header_account()}>
      <LogoutButton style="row" />
    </SettingsBlock>
  {/if}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .settings-page {
    display: flex;
    flex-direction: column;
    gap: var(--gap-l);
    padding: var(--ni-72) var(--gap-m) var(--trakttime-bottom-nav-height);
  }
</style>
