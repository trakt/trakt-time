<script lang="ts">
  import CoverImageIcon from "$lib/components/icons/CoverImageIcon.svelte";
  import GlobeIcon from "$lib/components/icons/GlobeIcon.svelte";
  import LocalePicker from "$lib/features/i18n/components/LocalePicker.svelte";
  import * as m from "$lib/features/i18n/messages.ts";
  import ProfileHeaderPicker from "$lib/features/profile-header/ProfileHeaderPicker.svelte";
  import DarkMode from "$lib/features/theme/components/DarkMode.svelte";
  import ThemePicker from "$lib/features/theme/components/ThemePicker.svelte";
  import SettingsBlock from "./SettingsBlock.svelte";
  import SettingsRow from "./SettingsRow.svelte";
</script>

<SettingsBlock id="appearance" title={m.header_appearance()}>
  <SettingsRow title={m.text_theme()} tone="purple">
    {#snippet icon()}
      <DarkMode />
    {/snippet}
    <ThemePicker />
  </SettingsRow>

  <SettingsRow title={m.text_profile_header()} tone="rose">
    {#snippet icon()}
      <CoverImageIcon />
    {/snippet}
    <ProfileHeaderPicker />
  </SettingsRow>

  <SettingsRow title={m.text_language()} tone="blue">
    {#snippet icon()}
      <GlobeIcon />
    {/snippet}
    <LocalePicker />
  </SettingsRow>
</SettingsBlock>
