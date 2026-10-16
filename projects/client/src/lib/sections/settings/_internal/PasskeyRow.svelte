<script lang="ts">
  import ExternalLinkIcon from '$lib/components/icons/ExternalLinkIcon.svelte';
  import LockIcon from '$lib/components/icons/LockIcon.svelte';
  import { resolveOidcAuthority } from '$lib/features/auth/resolveOidcAuthority.ts';
  import * as m from '$lib/paraglide/messages.js';
  import SettingsRow from './SettingsRow.svelte';

  const href = `${resolveOidcAuthority()}/passkey`;
</script>

<SettingsRow
  externalHref={href}
  title={m.text_passkey()}
  subtitle={m.description_passkey()}
  tone="purple"
>
  {#snippet icon()}
    <LockIcon />
  {/snippet}
  <span class="passkey-manage">{m.button_text_manage_passkey()}</span>
  <ExternalLinkIcon size="small" />
</SettingsRow>

<style lang="scss">
  .passkey-manage {
    font-size: 0.8125rem;
    font-weight: 600;
  }
</style>
