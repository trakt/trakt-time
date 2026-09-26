<script lang="ts">
  import SettingsIcon from '$lib/components/icons/SettingsIcon.svelte';
  import { useUser } from '$lib/features/auth/stores/useUser.ts';
  import * as m from '$lib/paraglide/messages.js';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';

  const { user } = useUser();

  const displayName = $derived($user.name?.full || $user.username);
</script>

<div class="side-nav-account">
  <a
    class="side-nav-account-link"
    href={UrlBuilder.profile.me()}
    aria-label={m.button_label_view_profile()}
  >
    <img
      class="side-nav-account-avatar"
      class:is-vip={$user.isVip}
      src={$user.avatar.url}
      alt=""
    />
    <span class="side-nav-account-text">
      <span class="side-nav-account-name">{displayName}</span>
      <span class="side-nav-account-handle">@{$user.username}</span>
    </span>
  </a>
  <a
    class="side-nav-account-settings"
    href="/settings"
    aria-label={m.page_title_settings()}
  >
    <SettingsIcon />
  </a>
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .side-nav-account {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
    padding: var(--gap-xs);
    border-radius: var(--border-radius-l);
    background: var(--color-card-background);
    border: var(--ni-1) solid var(--color-border);
  }

  .side-nav-account-link {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    color: var(--color-text-primary);
    text-decoration: none;
  }

  .side-nav-account-avatar {
    width: var(--ni-36);
    height: var(--ni-36);
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;

    &.is-vip {
      box-shadow:
        0 0 0 var(--ni-2) var(--color-card-background),
        0 0 0 var(--ni-4) var(--trakttime-accent);
    }
  }

  .side-nav-account-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .side-nav-account-name,
  .side-nav-account-handle {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .side-nav-account-name {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .side-nav-account-handle {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .side-nav-account-settings {
    display: grid;
    place-items: center;
    width: var(--ni-36);
    height: var(--ni-36);
    flex-shrink: 0;
    border-radius: var(--border-radius-m);
    color: var(--color-text-secondary);
    transition: color var(--transition-increment) ease-in-out;

    :global(svg) {
      width: var(--trakttime-icon-sm);
      height: var(--trakttime-icon-sm);
    }

    @include for-mouse {
      &:hover {
        color: var(--color-text-primary);
        background: var(--trakttime-tag-background);
      }
    }
  }
</style>
