import { page } from '$app/state';
import DiscoverIcon from '$lib/components/icons/DiscoverIcon.svelte';
import MovieIcon from '$lib/components/icons/MovieIcon.svelte';
import ProfileIcon from '$lib/components/icons/ProfileIcon.svelte';
import ShowIcon from '$lib/components/icons/ShowIcon.svelte';
import * as m from '$lib/paraglide/messages.js';

export function useMainNavTabs() {
  const tabs = $derived(
    [
      { href: '/shows', label: m.page_title_shows(), icon: ShowIcon },
      { href: '/movies', label: m.page_title_movies(), icon: MovieIcon },
      { href: '/discover', label: m.page_title_discover(), icon: DiscoverIcon },
      { href: '/profile', label: m.page_title_profile(), icon: ProfileIcon },
    ] as const,
  );

  const activeIndex = $derived(
    tabs.findIndex(({ href }) => page.url.pathname.startsWith(href)),
  );

  return {
    get tabs() {
      return tabs;
    },
    get activeIndex() {
      return activeIndex;
    },
  };
}
