<script lang="ts">
  import Button from '$lib/components/buttons/Button.svelte';
  import { useUser } from '$lib/features/auth/stores/useUser.ts';
  import { ConfirmationType } from '$lib/features/confirmation/models/ConfirmationType.ts';
  import { useConfirm } from '$lib/features/confirmation/useConfirm.ts';
  import { getLocale } from '$lib/features/i18n/index.ts';
  import * as m from '$lib/paraglide/messages.js';
  import type { VipSubscription } from '$lib/requests/models/VipSubscription.ts';
  import { toLinkParts } from '$lib/utils/string/toLinkParts.ts';
  import { toHumanDay } from '$lib/utils/formatting/date/toHumanDay.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import { useVip } from './useVip.ts';

  const { subscription }: { subscription: VipSubscription } = $props();

  const { user } = useUser();
  const { manageSubscription, cancelSubscription, isFetching } = useVip();

  const isStripe = $derived(subscription.gateway === 'stripe');

  let isMissingSubscription = $state(false);

  const missingMessage = $derived(
    toLinkParts(m.text_vip_subscription_missing_message()),
  );

  const onManage = async () => {
    const result = await manageSubscription();

    if (result.kind === 'redirect') {
      globalThis.window.location.href = result.url;
      return;
    }

    isMissingSubscription = result.kind === 'missing-subscription';
  };

  const onCancel = async () => {
    const isCancelled = await cancelSubscription();
    isMissingSubscription = !isCancelled;
  };

  const renewsOn = $derived(
    toHumanDay({
      date: subscription.renewsAt ?? subscription.expiresAt ?? new Date(),
      locale: getLocale(),
    }),
  );

  const { confirm } = useConfirm();
  const confirmCancel = $derived(
    confirm({
      type: ConfirmationType.CancelVip,
      renewsOn,
      onConfirm: onCancel,
    }),
  );
</script>

<div class="vip-subscription-actions">
  {#if subscription.renewsAt && isStripe}
    <Button
      size="small"
      style="flat"
      variant="secondary"
      color="default"
      label={m.button_label_manage_vip()}
      disabled={$isFetching}
      onclick={onManage}
    >
      {m.button_text_manage_vip()}
    </Button>

    <Button
      size="small"
      style="flat"
      variant="secondary"
      color="red"
      label={m.button_label_cancel_vip()}
      disabled={$isFetching}
      onclick={confirmCancel}
    >
      {m.button_text_cancel_vip()}
    </Button>
  {:else if subscription.renewsAt && subscription.manageUrl}
    <Button
      size="small"
      style="flat"
      variant="secondary"
      color="default"
      label={m.button_label_manage_vip()}
      href={subscription.manageUrl}
      target="_blank"
    >
      {m.button_text_manage_vip()}
    </Button>
  {:else if !subscription.renewsAt}
    <Button
      size="small"
      style="flat"
      variant="primary"
      color="purple"
      label={m.button_label_renew_vip()}
      href={UrlBuilder.renewVip()}
    >
      {m.button_text_renew_vip()}
    </Button>
  {/if}
</div>

{#if isMissingSubscription}
  <div class="vip-subscription-missing" role="alert">
    <strong>{m.text_vip_subscription_missing_title()}</strong>
    <p>
      {missingMessage.before}{#if missingMessage.label}<a
          href={UrlBuilder.og.support($user.slug)}
          target="_blank"
          rel="noopener noreferrer">{missingMessage.label}</a
        >{/if}{missingMessage.after}
    </p>
  </div>
{/if}

<style lang="scss">
  .vip-subscription-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-s);
  }

  .vip-subscription-missing {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxs);

    padding: var(--gap-s) var(--gap-m);
    border-radius: var(--border-radius-m);
    background: color-mix(in srgb, var(--color-background-red) 12%, transparent);
    border: var(--ni-1) solid var(--color-background-red);
    color: var(--color-text-primary);

    p {
      margin: 0;
      font-size: 0.8125rem;
    }

    a {
      color: inherit;
      text-decoration: underline;
    }
  }
</style>
