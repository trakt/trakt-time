import {
  animate,
  glow,
  originOf,
  prefersReducedMotion,
  vibrate,
} from './_internal/motion.ts';
import { playEffect } from './_internal/playEffect.ts';
import FlyToTab from './effects/FlyToTab.svelte';
import { bumpNavBadge, visibleNavTab } from './navBadges.ts';

type FlyToWatchlistParams = {
  poster: Element;
  imageUrl: string;
  type: 'show' | 'movie';
};

const TAB_BY_TYPE = { show: '/shows', movie: '/movies' } as const;

function land(href: string, tab: HTMLElement | null) {
  bumpNavBadge(href);
  if (!tab) return;

  animate(
    tab,
    [{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }, {
      transform: 'scale(1)',
    }],
    { duration: 320, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
  );
}

export function flyToWatchlist(
  { poster, imageUrl, type }: FlyToWatchlistParams,
) {
  const href = TAB_BY_TYPE[type];
  const tab = visibleNavTab(href);
  vibrate(8);

  if (!tab || prefersReducedMotion()) {
    land(href, tab);
    glow(tab);
    return;
  }

  playEffect(FlyToTab, {
    origin: originOf(poster),
    target: originOf(tab),
    imageUrl,
    onLanded: () => land(href, tab),
  });
}
