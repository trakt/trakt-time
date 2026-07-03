<script lang="ts">
  import VipUpsellBadge from '$lib/components/badge/VipUpsellBadge.svelte';
  import Link from '$lib/components/link/Link.svelte';
  import { AnalyticsEvent } from '$lib/features/analytics/events/AnalyticsEvent.ts';
  import { useTrack } from '$lib/features/analytics/useTrack.ts';
  import * as m from '$lib/paraglide/messages.js';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';

  const {
    source,
    children,
    title,
  }: {
    source: string;
    title?: string;
  } & ChildrenProps = $props();

  const { track } = useTrack(AnalyticsEvent.VipUpsell);
</script>

<div class="upsell-cta">
  <Link
    href={UrlBuilder.vip()}
    label={m.link_label_get_vip()}
    color="inherit"
    onclick={() => track({ source })}
  >
    <div class="upsell-cta-body">
      <p class="upsell-cta-title">{title ?? m.text_vip_upsell_dive_deeper()}</p>
      <p class="upsell-cta-description">{@render children()}</p>
    </div>
    <VipUpsellBadge />
  </Link>
</div>

<style lang="scss">
  .upsell-cta {
    :global(.trakt-link) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--gap-m);

      padding: var(--gap-m);

      background: var(--color-card-background);
      border: var(--ni-1) solid var(--color-border);
      border-radius: var(--border-radius-m);

      text-decoration: none;
    }
  }

  .upsell-cta-body {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxs);
    min-width: 0;

    p {
      margin: 0;
    }
  }

  .upsell-cta-title {
    font-size: 0.9375rem;
    font-weight: 700;
  }

  .upsell-cta-description {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }
</style>
