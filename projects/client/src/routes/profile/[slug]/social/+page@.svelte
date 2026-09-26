<script lang="ts">
  import BackBar from '$lib/components/back-bar/BackBar.svelte';
  import { useUser } from '$lib/features/auth/stores/useUser.ts';
  import SeoHead from '$lib/features/seo/SeoHead.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import ProfilePeople from '$lib/sections/profile-people/ProfilePeople.svelte';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import type { PageProps } from './$types.ts';

  const { params }: PageProps = $props();

  const { user } = useUser();
  const isOwner = $derived(
    params.slug === 'me' || $user.username === params.slug,
  );
</script>

<SeoHead title="{m.page_title_social()} · {params.slug}" noindex />

<div class="people-page">
  <BackBar
    href={UrlBuilder.profile.user(params.slug)}
    label={m.page_title_social()}
  />
  <ProfilePeople slug={params.slug} {isOwner} />
</div>

<style lang="scss">
  .people-page {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    padding-top: var(--ni-72);
    padding-bottom: var(--trakttime-bottom-nav-height);
  }
</style>
