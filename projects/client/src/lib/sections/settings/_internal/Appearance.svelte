<script lang="ts">
  import GlobeIcon from "$lib/components/icons/GlobeIcon.svelte";
  import LocalePicker from "$lib/features/i18n/components/LocalePicker.svelte";
  import * as m from "$lib/features/i18n/messages.ts";
  import DarkMode from "$lib/features/theme/components/DarkMode.svelte";
  import ThemePicker from "$lib/features/theme/components/ThemePicker.svelte";
  import SettingsBlock from "./SettingsBlock.svelte";
  import SettingsRow from "./SettingsRow.svelte";
</script>

<SettingsBlock title={m.header_appearance()}>
  <SettingsRow title={m.text_theme()} tone="purple">
    {#snippet icon()}
      <DarkMode />
    {/snippet}
    <ThemePicker />
  </SettingsRow>

  <SettingsRow title={m.text_language()} tone="blue">
    {#snippet icon()}
      <GlobeIcon />
    {/snippet}
    <LocalePicker />
  </SettingsRow>
</SettingsBlock>
