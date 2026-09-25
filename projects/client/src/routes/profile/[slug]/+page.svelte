<script lang="ts">
  import SeoHead from '$lib/features/seo/SeoHead.svelte';
  import { useUser } from '$lib/features/auth/stores/useUser.ts';
  import ProfileContent from '$lib/sections/profile/ProfileContent.svelte';
  import type { PageProps } from './$types.ts';

  const { params }: PageProps = $props();

  const { user } = useUser();
  const isOwner = $derived(
    Boolean($user?.username) && $user.username === params.slug,
  );
</script>

<SeoHead title={params.slug} type="profile" />

<div class="profile-page">
  <ProfileContent slug={params.slug} {isOwner} />
</div>

<style lang="scss">
  .profile-page {
    display: flex;
    flex-direction: column;
    padding-bottom: var(--trakttime-bottom-nav-height);
  }
</style>
