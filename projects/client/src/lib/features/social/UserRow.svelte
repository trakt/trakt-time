<script lang="ts">
  import UserAvatar from '$lib/components/avatar/UserAvatar.svelte';
  import VipBadge from '$lib/components/badge/VipBadge.svelte';
  import type { UserProfile } from '$lib/requests/models/UserProfile.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import type { Snippet } from 'svelte';

  type Props = {
    profile: UserProfile;
    detail?: string;
    action?: Snippet;
  };

  const { profile, detail, action }: Props = $props();

  const slug = $derived(profile.slug ?? profile.username);
  const displayName = $derived(profile.name.full || profile.username);
</script>

<div class="user-row">
  <a class="user-row-link" href={UrlBuilder.profile.user(slug)}>
    <UserAvatar name={displayName} src={profile.avatar.url} size="m" />
    <span class="user-row-text">
      <span class="user-row-name">
        <span class="user-row-name-text">{displayName}</span>
        {#if profile.isVip}
          <VipBadge isDirector={profile.isDirector} />
        {/if}
      </span>
      <span class="user-row-detail">{detail ?? `@${profile.username}`}</span>
    </span>
  </a>
  {#if action}
    <span class="user-row-action">{@render action()}</span>
  {/if}
</div>

<style lang="scss">
  .user-row {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    padding: var(--gap-s) var(--gap-s) var(--gap-s) var(--gap-m);
  }

  .user-row-link {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    flex: 1;
    min-width: 0;
    text-decoration: none;
    color: inherit;

    &:focus-visible {
      outline: var(--ni-2) solid var(--trakttime-accent);
      outline-offset: var(--ni-2);
      border-radius: var(--border-radius-s);
    }
  }

  .user-row-text {
    display: flex;
    flex-direction: column;
    gap: var(--ni-2);
    min-width: 0;
  }

  .user-row-name {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
    min-width: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .user-row-name-text,
  .user-row-detail {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-row-detail {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .user-row-action {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
    flex-shrink: 0;
  }
</style>
