<script lang="ts">
  import VipBadge from '$lib/components/badge/VipBadge.svelte';
  import Button from '$lib/components/buttons/Button.svelte';
  import UpsellCta from '$lib/features/upsell/UpsellCta.svelte';
  import RenderFor from '$lib/guards/RenderFor.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import SettingsBlock from './SettingsBlock.svelte';
  import SettingsRow from './SettingsRow.svelte';
</script>

<SettingsBlock
  title={m.tag_text_vip()}
  description={m.text_vip_upsell_default()}
>
  <RenderFor audience="free">
    <UpsellCta source="settings">
      {m.text_vip_get_insights()}
    </UpsellCta>
  </RenderFor>

  <RenderFor audience="vip">
    <SettingsRow title={m.button_label_manage_subscription()}>
      {#snippet action()}
        <div class="vip-settings-action">
          <VipBadge />
          <Button
            size="small"
            style="flat"
            variant="secondary"
            color="default"
            label={m.button_label_manage_vip()}
            href={UrlBuilder.vip()}
          >
            {m.button_text_manage_vip()}
          </Button>
        </div>
      {/snippet}
    </SettingsRow>
  </RenderFor>
</SettingsBlock>

<style lang="scss">
  .vip-settings-action {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
  }
</style>
