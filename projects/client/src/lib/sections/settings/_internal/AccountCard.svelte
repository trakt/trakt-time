<script lang="ts">
  import VipBadge from '$lib/components/badge/VipBadge.svelte';
  import ChevronRightIcon from '$lib/components/icons/ChevronRightIcon.svelte';
  import { useUser } from '$lib/features/auth/stores/useUser.ts';
  import { getLocale } from '$lib/features/i18n/index.ts';
  import * as m from '$lib/paraglide/messages.js';
  import { toHumanMonthYear } from '$lib/utils/formatting/date/toHumanMonthYear.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';

  const { user } = useUser();

  const displayName = $derived($user.name?.full || $user.username);
  const handle = $derived(
    [
      `@${$user.username}`,
      $user.joinedAt
        ? m.text_member_since({
          date: toHumanMonthYear($user.joinedAt, getLocale()),
        })
        : null,
    ].filter(Boolean).join(' · '),
  );
</script>

<a
  class="account-card"
  href={UrlBuilder.profile.me()}
  aria-label={m.button_label_view_profile()}
>
  <span class="account-avatar" class:is-vip={$user.isVip}>
    <img src={$user.avatar.url} alt="" />
  </span>
  <span class="account-text">
    <span class="account-name">
      <span class="account-name-text">{displayName}</span>
      {#if $user.isVip}
        <VipBadge isDirector={$user.isDirector} />
      {/if}
    </span>
    <span class="account-handle">{handle}</span>
  </span>
  <span class="account-chevron"><ChevronRightIcon /></span>
</a>

<style lang="scss">
  .account-card {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    padding: var(--gap-s) var(--gap-s) var(--gap-s) var(--gap-m);
    border-radius: var(--border-radius-xl);
    background: var(--color-card-background);
    color: var(--color-text-primary);
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;

    &:active {
      background: var(--color-floating-background);
    }
  }

  .account-avatar {
    flex-shrink: 0;
    width: var(--ni-56);
    height: var(--ni-56);
    padding: var(--ni-2);
    border-radius: 50%;
    background: var(--color-border);

    &.is-vip {
      background: var(--trakttime-gradient);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      border: var(--ni-2) solid var(--color-card-background);
    }
  }

  .account-text {
    display: flex;
    flex-direction: column;
    gap: var(--ni-2);
    flex: 1;
    min-width: 0;
  }

  .account-name {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
    font-family: var(--trakttime-font-heading);
    font-size: 1.125rem;
    font-weight: 700;
  }

  .account-name-text,
  .account-handle {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .account-handle {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .account-chevron {
    display: inline-flex;
    flex-shrink: 0;
    color: var(--color-text-secondary);

    :global(svg) {
      width: var(--trakttime-icon-md);
      height: var(--trakttime-icon-md);
    }
  }
</style>
