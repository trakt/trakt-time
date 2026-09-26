<script lang="ts">
  import { page } from '$app/state';
  import { replaceSearchParam } from '$lib/utils/url/replaceSearchParam.ts';
  import { toSearchParamValue } from '$lib/utils/url/toSearchParamValue.ts';
  import UserAvatar from '$lib/components/avatar/UserAvatar.svelte';
  import SegmentedControl from '$lib/components/segmented-control/SegmentedControl.svelte';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import * as m from '$lib/paraglide/messages.js';
  import { followersQuery } from '$lib/requests/queries/users/followersQuery.ts';
  import { followingQuery } from '$lib/requests/queries/users/followingQuery.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';

  const { slug }: { slug: string } = $props();

  const PREVIEW_COUNT = 12;

  const PEOPLE_TABS = ['following', 'followers'] as const;

  const tab = $derived(
    toSearchParamValue({
      value: page.url.searchParams.get('people'),
      options: PEOPLE_TABS,
      fallback: 'following',
    }),
  );

  const following = $derived(useQuery(followingQuery({ slug })));
  const followers = $derived(useQuery(followersQuery({ slug })));

  const profiles = $derived(
    (tab === 'following' ? $following.data : $followers.data) ?? [],
  );

  const options = [
    { value: 'following' as const, label: m.button_text_following() },
    { value: 'followers' as const, label: m.button_text_followers() },
  ];
</script>

<div class="people-toggle">
  <SegmentedControl
    label={m.list_title_social()}
    value={tab}
    {options}
    onChange={(value) =>
      replaceSearchParam({ url: page.url, key: 'people', value })}
  />
</div>

{#if profiles.length === 0}
  <p class="people-empty">
    {tab === 'following' ? m.list_placeholder_following() : m.list_placeholder_followers()}
  </p>
{:else}
  <div class="people-row">
    {#each profiles.slice(0, PREVIEW_COUNT) as profile (profile.key)}
      <a
        class="people-item"
        href={UrlBuilder.profile.user(profile.slug ?? profile.username)}
      >
        <UserAvatar name={profile.username} src={profile.avatar.url} size="l" />
        <span class="people-name">{profile.username}</span>
      </a>
    {/each}
  </div>
{/if}

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .people-toggle {
    padding: 0 var(--trakttime-page-gutter) var(--gap-s);
  }

  .people-row {
    @include scrollable-row;
    gap: var(--gap-m);
    padding: 0 var(--trakttime-page-gutter);
  }

  .people-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-xxs);
    flex-shrink: 0;
    width: var(--ni-72);
    text-decoration: none;

    &:focus-visible {
      outline: var(--ni-2) solid var(--trakttime-accent);
      outline-offset: var(--ni-2);
      border-radius: var(--border-radius-m);
    }
  }

  .people-name {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.75rem;
    color: var(--color-text-primary);
  }

  .people-empty {
    margin: 0;
    padding: var(--gap-l) var(--trakttime-page-gutter);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    text-align: center;
  }
</style>
