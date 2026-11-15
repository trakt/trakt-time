import { NOOP_FN } from '$lib/utils/constants.ts';
import type { ActionReturn } from 'svelte/action';

type Callback = () => void;

type WhenInViewportParams =
  | Callback
  | {
      readonly callback: Callback;
      readonly requiresObserver?: boolean;
    };

export function whenInViewport(
  element: HTMLElement,
  params: WhenInViewportParams,
): ActionReturn<WhenInViewportParams> {
  const { callback, requiresObserver } =
    typeof params === 'function'
      ? { callback: params, requiresObserver: false }
      : params;

  if (typeof IntersectionObserver === 'undefined') {
    if (!requiresObserver) callback();
    return { destroy: NOOP_FN };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          queueMicrotask(() => observer.disconnect());
        }
      });
    },
    { threshold: 0.1 },
  );

  if (element) {
    observer.observe(element);
  }

  return {
    destroy: () => {
      observer.disconnect();
    },
  };
}
