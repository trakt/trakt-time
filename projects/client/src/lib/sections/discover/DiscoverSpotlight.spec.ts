import type { TrendingEntry } from '$lib/sections/lists/trending/useTrendingList.ts';
import { render, screen } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DiscoverSpotlight from './DiscoverSpotlight.svelte';

vi.mock('$lib/sections/media-actions/watchlist/useWatchlist.ts', () => ({
  useWatchlist: () => ({
    isWatchlisted: new BehaviorSubject(false),
    isWatchlistUpdating: new BehaviorSubject(false),
    addToWatchlist: vi.fn(),
    removeFromWatchlist: vi.fn(),
  }),
}));

const ROTATE_MS = 8000;

const items = ['a', 'b', 'c'].map((slug, index) => ({
  id: index + 1,
  slug,
  title: `Show ${slug}`,
  year: 2020,
  overview: '',
  cover: { url: { medium: `https://img/${slug}.jpg` } },
})) as unknown as ReadonlyArray<TrendingEntry>;

let reportInView: (isIntersecting: boolean) => void;

function setHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => hidden,
  });
  document.dispatchEvent(new Event('visibilitychange'));
}

const activeTitle = () =>
  document.querySelector('.discover-spotlight-title')?.textContent?.trim();

describe('DiscoverSpotlight', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'matchMedia',
      () => ({ matches: false }) as MediaQueryList,
    );
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          reportInView = (isIntersecting) =>
            callback(
              [{ isIntersecting } as IntersectionObserverEntry],
              this as unknown as IntersectionObserver,
            );
        }
        observe() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    setHidden(false);
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('should rotate every 8 seconds while on screen and visible', () => {
    render(DiscoverSpotlight, { props: { items } });
    reportInView(true);
    flushSync();

    vi.advanceTimersByTime(ROTATE_MS);
    flushSync();

    expect(activeTitle()).toBe('Show b');
  });

  it('should not rotate while the section is off screen', () => {
    render(DiscoverSpotlight, { props: { items } });
    reportInView(false);
    flushSync();

    vi.advanceTimersByTime(ROTATE_MS);
    flushSync();

    expect(activeTitle()).toBe('Show a');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('should not rotate while the tab is hidden', () => {
    render(DiscoverSpotlight, { props: { items } });
    reportInView(true);
    setHidden(true);
    flushSync();

    vi.advanceTimersByTime(ROTATE_MS);
    flushSync();

    expect(activeTitle()).toBe('Show a');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('should resume rotating when the tab becomes visible again', () => {
    render(DiscoverSpotlight, { props: { items } });
    reportInView(true);
    setHidden(true);
    flushSync();
    setHidden(false);
    flushSync();

    vi.advanceTimersByTime(ROTATE_MS);
    flushSync();

    expect(activeTitle()).toBe('Show b');
    expect(screen.getByRole('link', { name: 'Show b' })).toBeInTheDocument();
  });
});
