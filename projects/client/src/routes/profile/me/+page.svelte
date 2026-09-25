<script lang="ts">
  import SeoHead from '$lib/features/seo/SeoHead.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import ProfileHeaderSkeleton from '$lib/sections/profile/_internal/ProfileHeaderSkeleton.svelte';
  import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
  import { useUser } from '$lib/features/auth/stores/useUser.ts';
  import LoginGate from '$lib/components/auth/LoginGate.svelte';
  import ProfileContent from '$lib/sections/profile/ProfileContent.svelte';

  const { isAuthorized, login } = useAuth();
  const { user } = useUser();

  const slug = $derived($user?.slug ?? $user?.username ?? null);
</script>

<SeoHead title={m.page_title_profile()} noindex />

<div class="profile-page">
  {#if !$isAuthorized}
    <LoginGate {login} />
  {:else if !slug}
    <ProfileHeaderSkeleton />
  {:else}
    <ProfileContent {slug} isOwner={true} />
  {/if}
</div>

<style lang="scss">
  .profile-page {
    display: flex;
    flex-direction: column;
    padding-bottom: var(--trakttime-bottom-nav-height);
  }
</style>
