<script lang="ts">
  import { useUser } from '$lib/features/auth/stores/useUser.ts';
  import { toLinkParts } from '$lib/utils/string/toLinkParts.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';

  type Props = {
    title: string;
    message: string;
  };

  const { title, message }: Props = $props();

  const { user } = useUser();

  const messageParts = $derived(toLinkParts(message));
</script>

<div class="vip-failure-alert" role="alert">
  <strong>{title}</strong>
  <!-- eslint-disable svelte/no-navigation-without-resolve -->
  <p>
    {messageParts.before}{#if messageParts.label}<a
        href={UrlBuilder.og.support($user.slug)}
        target="_blank"
        rel="noopener noreferrer">{messageParts.label}</a
      >{/if}{messageParts.after}
  </p>
  <!-- eslint-enable svelte/no-navigation-without-resolve -->
</div>

<style lang="scss">
  .vip-failure-alert {
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
