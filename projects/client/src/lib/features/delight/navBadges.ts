import { BehaviorSubject, map } from 'rxjs';

const badges = new BehaviorSubject<Readonly<Record<string, number>>>({});

export function bumpNavBadge(href: string) {
  badges.next({ ...badges.value, [href]: (badges.value[href] ?? 0) + 1 });
}

export function clearNavBadge(href: string) {
  if (!badges.value[href]) return;
  badges.next({ ...badges.value, [href]: 0 });
}

export function navBadge(href: string) {
  return badges.pipe(map((counts) => counts[href] ?? 0));
}

export function visibleNavTab(href: string): HTMLElement | null {
  return [...document.querySelectorAll<HTMLElement>(`[data-nav-tab="${href}"]`)]
    .find((tab) => tab.offsetParent !== null) ?? null;
}
