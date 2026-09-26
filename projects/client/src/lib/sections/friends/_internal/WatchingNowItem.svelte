<script lang="ts">
  import UserAvatar from '$lib/components/avatar/UserAvatar.svelte';
  import type { NowPlayingItem } from '$lib/requests/models/NowPlayingItem.ts';
  import type { UserProfile } from '$lib/requests/models/UserProfile.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';

  const { profile, item }: { profile: UserProfile; item: NowPlayingItem } =
    $props();

  const slug = $derived(profile.slug ?? profile.username);
  const title = $derived(
    item.type === 'episode' ? item.show.title : item.media.title,
  );
</script>

<a class="watching-now-item" href={UrlBuilder.profile.user(slug)}>
  <span class="watching-now-ring">
    <UserAvatar name={profile.username} src={profile.avatar.url} size="l" />
  </span>
  <span class="watching-now-name">{profile.username}</span>
  <span class="watching-now-title">{title}</span>
</a>

<style lang="scss">
  .watching-now-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--ni-4);
    flex-shrink: 0;
    width: var(--ni-80);
    text-align: center;
    text-decoration: none;

    &:focus-visible {
      outline: var(--ni-2) solid var(--trakttime-accent);
      outline-offset: var(--ni-2);
      border-radius: var(--border-radius-m);
    }
  }

  .watching-now-ring {
    display: inline-flex;
    padding: var(--ni-2);
    border-radius: 50%;
    background: var(--trakttime-gradient);

    > :global(*) {
      box-shadow: 0 0 0 var(--ni-2) var(--color-background);
    }
  }

  .watching-now-name,
  .watching-now-title {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .watching-now-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .watching-now-title {
    font-size: 0.6875rem;
    color: var(--color-text-secondary);
  }
</style>
