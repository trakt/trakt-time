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

  type SubscriptionFailure = 'missing' | 'manage' | 'cancel';

  const { subscription }: { subscription: VipSubscription } = $props();

  const { user } = useUser();
  const { manageSubscription, cancelSubscription, isFetching } = useVip();

  const isStripe = $derived(subscription.gateway === 'stripe');

  let failure = $state<SubscriptionFailure | null>(null);

  function toFailureCopy(kind: SubscriptionFailure | null) {
    if (kind === 'missing') {
      return {
        title: m.text_vip_subscription_missing_title(),
        message: m.text_vip_subscription_missing_message(),
      };
    }

    return {
      title: kind === 'manage'
        ? m.text_vip_manage_failed_title()
        : m.text_vip_cancel_failed_title(),
      message: m.text_vip_subscription_failed_message(),
    };
  }

  const failureCopy = $derived(toFailureCopy(failure));
  const failureMessage = $derived(toLinkParts(failureCopy.message));

  async function reportFailure<T>(
    request: () => Promise<T>,
    kind: SubscriptionFailure,
  ): Promise<T> {
    try {
      return await request();
    } catch (error) {
      failure = kind;
      throw error;
    }
  }

  const onManage = async () => {
    const result = await reportFailure(manageSubscription, 'manage');

    if (result.kind === 'redirect') {
      globalThis.window.location.href = result.url;
      return;
    }

    failure = result.kind === 'missing-subscription' ? 'missing' : 'manage';
  };

  const onCancel = async () => {
    const isCancelled = await reportFailure(cancelSubscription, 'cancel');
    failure = isCancelled ? null : 'missing';
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

{#if failure}
  <div class="vip-subscription-failure" role="alert">
    <strong>{failureCopy.title}</strong>
    <p>
      {failureMessage.before}{#if failureMessage.label}<a
          href={UrlBuilder.og.support($user.slug)}
          target="_blank"
          rel="noopener noreferrer">{failureMessage.label}</a
        >{/if}{failureMessage.after}
    </p>
  </div>
{/if}

<style lang="scss">
  .vip-subscription-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-s);
  }

  .vip-subscription-failure {
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
