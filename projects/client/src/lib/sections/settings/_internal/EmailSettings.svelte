<script lang="ts">
  import CalendarIcon from '$lib/components/icons/CalendarIcon.svelte';
  import EmailIcon from '$lib/components/icons/EmailIcon.svelte';
  import LockIcon from '$lib/components/icons/LockIcon.svelte';
  import SparkleIcon from '$lib/components/icons/SparkleIcon.svelte';
  import Switch from '$lib/components/toggles/Switch.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import SettingsBlock from './SettingsBlock.svelte';
  import SettingsRow from './SettingsRow.svelte';
  import { useEmailSettings } from './useEmailSettings.ts';

  const { settings, set } = useEmailSettings();

  const rows = $derived([
    {
      category: 'notifications' as const,
      icon: EmailIcon,
      title: m.text_emails_notifications(),
      subtitle: m.description_emails_notifications(),
      label: m.switch_label_emails_notifications(),
      isEnabled: $settings?.hasNotifications ?? false,
      tone: 'blue' as const,
    },
    {
      category: 'recaps' as const,
      icon: CalendarIcon,
      title: m.text_emails_recaps(),
      subtitle: m.description_emails_recaps(),
      label: m.switch_label_emails_recaps(),
      isEnabled: $settings?.hasRecaps ?? false,
      tone: 'orange' as const,
    },
    {
      category: 'marketing' as const,
      icon: SparkleIcon,
      title: m.text_emails_marketing(),
      subtitle: m.description_emails_marketing(),
      label: m.switch_label_emails_marketing(),
      isEnabled: $settings?.hasMarketing ?? false,
      tone: 'rose' as const,
    },
  ]);
</script>

<SettingsBlock id="emails" title={m.header_emails()}>
  <SettingsRow
    title={m.text_emails_system()}
    subtitle={m.description_emails_system()}
    tone="green"
  >
    {#snippet icon()}
      <LockIcon />
    {/snippet}
    <span class="email-always-on">{m.tag_text_emails_always_on()}</span>
  </SettingsRow>

  {#each rows as row (row.category)}
    <SettingsRow title={row.title} subtitle={row.subtitle} tone={row.tone}>
      {#snippet icon()}
        <row.icon />
      {/snippet}
      {#if $settings}
        <Switch
          label={row.label}
          checked={row.isEnabled}
          onchange={(isEnabled) => set(row.category, isEnabled)}
        />
      {:else}
        <span class="email-switch-skeleton" aria-hidden="true"></span>
      {/if}
    </SettingsRow>
  {/each}
</SettingsBlock>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .email-always-on {
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .email-switch-skeleton {
    display: block;
    width: var(--ni-44);
    height: var(--ni-24);
    border-radius: var(--trakttime-radius-pill);
    @include shimmer-bg-elevated;
  }
</style>
