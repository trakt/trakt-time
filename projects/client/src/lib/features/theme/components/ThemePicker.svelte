<script lang="ts">
  import type { Snippet } from "svelte";
  import { WorkerMessage } from "$worker/WorkerMessage";
  import { workerRequest } from "$worker/workerRequest";
  import { Theme } from "../models/Theme";
  import { useTheme } from "../useTheme";
  import DarkMode from "./DarkMode.svelte";
  import LightMode from "./LightMode.svelte";
  import AutoMode from "./SystemMode.svelte";

  import SegmentedControl from "$lib/components/segmented-control/SegmentedControl.svelte";
  import { useAuth } from "$lib/features/auth/stores/useAuth";
  import * as m from "$lib/features/i18n/messages";
  import { useSettings } from "$lib/sections/settings/_internal/useSettings";

  const { set, theme } = useTheme();

  const availableThemes = [Theme.System, Theme.Light, Theme.Dark];

  const { isAuthorized } = useAuth();
  const { theme: themeSettings } = useSettings();

  const themeToTitle: Record<Theme, string> = {
    [Theme.Light]: m.option_text_theme_light(),
    [Theme.Dark]: m.option_text_theme_dark(),
    [Theme.System]: m.option_text_theme_system(),
  };

  async function submitTheme(value: Theme) {
    set(value);
    await workerRequest(WorkerMessage.CacheBust);

    if ($isAuthorized) {
      await themeSettings.set(value);
    }
  }

  const themeToIcon: Record<Theme, Snippet> = {
    [Theme.Light]: lightIcon,
    [Theme.Dark]: darkIcon,
    [Theme.System]: systemIcon,
  };

  const options = availableThemes.map((theme) => ({
    value: theme,
    label: themeToTitle[theme],
    icon: themeToIcon[theme],
  }));
</script>

{#snippet lightIcon()}
  <LightMode />
{/snippet}

{#snippet darkIcon()}
  <DarkMode />
{/snippet}

{#snippet systemIcon()}
  <AutoMode />
{/snippet}

<SegmentedControl
  label={m.text_theme()}
  value={$theme}
  onChange={submitTheme}
  {options}
  surface="card"
/>
