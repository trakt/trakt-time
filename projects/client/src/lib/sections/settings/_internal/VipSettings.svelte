<script lang="ts">
  import UpsellCta from '$lib/features/upsell/UpsellCta.svelte';
  import RenderFor from '$lib/guards/RenderFor.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import SettingsBlock from './SettingsBlock.svelte';
</script>

<RenderFor audience="free">
  <SettingsBlock title={m.tag_text_vip()}>
    <div class="vip-upsell">
      <UpsellCta source="settings">
        {m.text_vip_get_insights()}
      </UpsellCta>
    </div>
  </SettingsBlock>
</RenderFor>

<RenderFor audience="vip">
  <div class="vip-card">
    <div class="vip-card-text">
      <span class="vip-card-eyebrow">{m.header_your_plan()}</span>
      <h2 class="vip-card-title">{m.text_vip_plan_name()}</h2>
      <p class="vip-card-body">{m.text_vip_thanks()}</p>
    </div>
    <a
      class="vip-card-manage"
      href={UrlBuilder.vip()}
      aria-label={m.button_label_manage_subscription()}
    >
      {m.button_text_manage_vip()}
    </a>
  </div>
</RenderFor>

<style lang="scss">
  .vip-upsell {
    padding: var(--gap-m);
  }

  .vip-card {
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--gap-s);
    padding: var(--gap-m);
    border-radius: var(--border-radius-xxl);
    background: var(--trakttime-gradient);
    color: var(--shade-10);
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      inset-inline-end: calc(var(--ni-40) * -1);
      top: calc(var(--ni-64) * -1);
      width: var(--ni-200);
      height: var(--ni-200);
      border-radius: 50%;
      background: color-mix(in srgb, var(--shade-10) 12%, transparent);
      pointer-events: none;
    }
  }

  .vip-card-text {
    display: flex;
    flex-direction: column;
    gap: var(--ni-4);
    min-width: 0;
  }

  .vip-card-eyebrow {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--shade-10) 80%, transparent);
  }

  .vip-card-title {
    margin: 0;
    font-family: var(--trakttime-font-heading);
    font-size: 1.375rem;
    font-weight: 700;
  }

  .vip-card-body {
    margin: 0;
    font-size: 0.8125rem;
    color: color-mix(in srgb, var(--shade-10) 85%, transparent);
  }

  .vip-card-manage {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    padding: var(--gap-xs) var(--gap-s);
    border-radius: var(--trakttime-radius-pill);
    background: var(--shade-10);
    color: var(--purple-700);
    font-size: 0.8125rem;
    font-weight: 600;
    text-decoration: none;

    &:focus-visible {
      outline: var(--ni-2) solid var(--shade-10);
      outline-offset: var(--ni-2);
    }
  }
</style>
