<script lang="ts">
  import { page } from '$app/state';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
  import CheckIcon from '$lib/components/icons/CheckIcon.svelte';
  import SegmentedControl from '$lib/components/segmented-control/SegmentedControl.svelte';
  import { useUser } from '$lib/features/auth/stores/useUser.ts';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import FollowButton from '$lib/features/social/FollowButton.svelte';
  import UserRow from '$lib/features/social/UserRow.svelte';
  import { useFollowRequests } from '$lib/features/social/useFollowRequests.ts';
  import * as m from '$lib/paraglide/messages.js';
  import type { UserProfile } from '$lib/requests/models/UserProfile.ts';
  import { followersQuery } from '$lib/requests/queries/users/followersQuery.ts';
  import { followingQuery } from '$lib/requests/queries/users/followingQuery.ts';
  import { replaceSearchParam } from '$lib/utils/url/replaceSearchParam.ts';
  import { toPeopleTab, type PeopleTab } from './toPeopleTab.ts';

  type Props = {
    slug: string;
    isOwner: boolean;
  };

  const { slug, isOwner }: Props = $props();

  const { user } = useUser();
  const followingResult = $derived(useQuery(followingQuery({ slug })));
  const followersResult = $derived(useQuery(followersQuery({ slug })));
  const { requests, pendingRequestIds, approve, deny } = useFollowRequests();

  const tab = $derived(
    toPeopleTab({ value: page.url.searchParams.get('tab'), isOwner }),
  );

  const setTab = (next: PeopleTab) =>
    replaceSearchParam({ url: page.url, key: 'tab', value: next });

  const options = $derived([
    { value: 'following' as const, label: m.button_text_following() },
    { value: 'followers' as const, label: m.button_text_followers() },
    ...(isOwner
      ? [{
        value: 'requests' as const,
        label: $requests.length > 0
          ? `${m.button_text_follow_requests()} · ${$requests.length}`
          : m.button_text_follow_requests(),
      }]
      : []),
  ]);

  const activeQuery = $derived(
    tab === 'followers' ? $followersResult : $followingResult,
  );
  const profiles = $derived(activeQuery.data ?? []);
  const isLoading = $derived(activeQuery.isLoading);

  const isSelf = (profile: UserProfile) =>
    profile.username === $user.username;

  const emptyText = $derived(
    tab === 'followers'
      ? m.list_placeholder_followers()
      : m.list_placeholder_following(),
  );
</script>

<div class="people-toggle">
  <SegmentedControl
    label={m.page_title_social()}
    value={tab}
    {options}
    onChange={setTab}
  />
</div>

{#if tab === 'requests'}
  {#if $requests.length === 0}
    <p class="people-empty">{m.list_placeholder_follow_requests()}</p>
  {:else}
    <div class="people-card">
      {#each $requests as request (request.id)}
        <UserRow profile={request.user}>
          {#snippet action()}
            <button
              type="button"
              class="request-approve"
              disabled={$pendingRequestIds.has(request.id)}
              aria-label={m.button_label_approve_follow_request({
                username: request.user.username,
              })}
              onclick={() => approve(request.id)}
            >
              <CheckIcon />
            </button>
            <button
              type="button"
              class="request-deny"
              disabled={$pendingRequestIds.has(request.id)}
              aria-label={m.button_label_reject_follow_request({
                username: request.user.username,
              })}
              onclick={() => deny(request.id)}
            >
              <CloseIcon />
            </button>
          {/snippet}
        </UserRow>
      {/each}
    </div>
  {/if}
{:else if isLoading && profiles.length === 0}
  <div class="people-loading"><LoadingIndicator /></div>
{:else if profiles.length === 0}
  <p class="people-empty">{emptyText}</p>
{:else}
  <div class="people-card">
    {#each profiles as profile (profile.key)}
      <UserRow {profile}>
        {#snippet action()}
          {#if !isSelf(profile)}
            <FollowButton
              slug={profile.slug ?? profile.username}
              username={profile.username}
              size="small"
            />
          {/if}
        {/snippet}
      </UserRow>
    {/each}
  </div>
{/if}

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .people-toggle {
    padding: 0 var(--trakttime-page-gutter) var(--gap-m);
  }

  .people-card {
    display: flex;
    flex-direction: column;
    margin: 0 var(--trakttime-page-gutter);
    border-radius: var(--border-radius-xl);
    background: var(--color-card-background);
    overflow: hidden;

    > :global(.user-row + .user-row) {
      border-top: var(--ni-1) solid var(--color-border);
    }
  }

  .people-empty,
  .people-loading {
    display: flex;
    justify-content: center;
    margin: 0;
    padding: var(--gap-xxl) var(--trakttime-page-gutter);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    text-align: center;
  }

  .request-approve,
  .request-deny {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ni-36);
    height: var(--ni-36);
    border: none;
    border-radius: 50%;
    cursor: pointer;

    :global(svg) {
      width: var(--ni-18);
      height: var(--ni-18);
    }

    &:disabled {
      opacity: 0.6;
      cursor: progress;
    }

    &:focus-visible {
      outline: var(--ni-2) solid var(--trakttime-accent);
      outline-offset: var(--ni-2);
    }
  }

  .request-approve {
    background: var(--trakttime-gradient);
    color: var(--trakttime-accent-foreground);
  }

  .request-deny {
    background: var(--color-floating-background);
    color: var(--color-text-primary);
  }

  @include for-desktop {
    .people-card {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: var(--ni-1);
      background: var(--color-border);

      > :global(.user-row) {
        background: var(--color-card-background);
      }

      > :global(.user-row + .user-row) {
        border-top: none;
      }

      > :global(.user-row:nth-child(n + 3)) {
        border-top: var(--ni-1) solid var(--color-border);
      }
    }
  }
</style>
