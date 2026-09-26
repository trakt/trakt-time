<script lang="ts">
  import SeoHead from '$lib/features/seo/SeoHead.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import AccountCard from '$lib/sections/settings/_internal/AccountCard.svelte';
  import Appearance from '$lib/sections/settings/_internal/Appearance.svelte';
  import SettingsBlock from '$lib/sections/settings/_internal/SettingsBlock.svelte';
  import SettingsNav from '$lib/sections/settings/_internal/SettingsNav.svelte';
  import SettingsRow from '$lib/sections/settings/_internal/SettingsRow.svelte';
  import VipSettings from '$lib/sections/settings/_internal/VipSettings.svelte';
  import DataImport from '$lib/sections/settings/_internal/import/DataImport.svelte';
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
    <div class="settings-aside">
      <AccountCard />
      <VipSettings />
      <div class="settings-aside-nav">
        <SettingsNav />
      </div>
    </div>
    <div class="settings-main">
      <Appearance />
      <DataImport />
      <SettingsBlock id="about" title={m.header_about()}>
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
      <SettingsBlock id="account" title={m.header_account()}>
        <LogoutButton style="row" />
      </SettingsBlock>
    </div>
  {/if}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .settings-page {
    display: flex;
    flex-direction: column;
    gap: var(--gap-l);
    padding: var(--ni-72) var(--trakttime-page-gutter)
      var(--trakttime-bottom-nav-height);

    @include for-tablet-sm-and-up {
      width: 100%;
      max-width: var(--ni-640);
      margin: 0 auto;
      box-sizing: border-box;
    }

    @include for-desktop {
      display: grid;
      grid-template-columns: var(--ni-300) minmax(0, var(--ni-640));
      justify-content: center;
      align-items: start;
      gap: var(--gap-xl);
      max-width: none;
    }
  }

  .settings-aside,
  .settings-main {
    display: contents;
  }

  .settings-aside-nav {
    display: none;
  }

  @include for-tablet-sm-and-up {
    .settings-aside {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(var(--ni-240), 1fr));
      align-items: start;
      gap: var(--gap-m);
    }
  }

  @include for-desktop {
    .settings-aside {
      position: sticky;
      top: var(--ni-72);
      display: flex;
      flex-direction: column;
      gap: var(--gap-m);
    }

    .settings-aside-nav {
      display: block;
    }

    .settings-main {
      display: flex;
      flex-direction: column;
      gap: var(--gap-l);
      min-width: 0;
    }
  }
</style>
