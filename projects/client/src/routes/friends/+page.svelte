<script lang="ts">
  import LoginGate from '$lib/components/auth/LoginGate.svelte';
  import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
  import SeoHead from '$lib/features/seo/SeoHead.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import FriendsFeed from '$lib/sections/friends/FriendsFeed.svelte';

  const { isAuthorized, login } = useAuth();
</script>

<SeoHead title={m.page_title_friends()} noindex />

<div class="friends-page">
  {#if $isAuthorized}
    <FriendsFeed />
  {:else}
    <LoginGate {login} />
  {/if}
</div>

<style lang="scss">
  .friends-page {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    padding-bottom: var(--trakttime-bottom-nav-height);
  }
</style>
