import type { DelightOrigin } from '../models/DelightOrigin.ts';

export function prefersReducedMotion(): boolean {
  return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ??
    false;
}

export function animate(
  element: Element,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
): Animation | null {
  if (!element.animate) return null;
  if (!prefersReducedMotion()) return element.animate(keyframes, options);

  return element.animate(keyframes, { ...options, duration: 0, delay: 0 });
}

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Some embedded browsers throw instead of ignoring vibrate.
  }
}

const GLOW_DURATION = 900;

export function glow(element: Element | null | undefined) {
  if (!element) return;

  element.setAttribute('data-delight-glow', '');
  setTimeout(() => element.removeAttribute('data-delight-glow'), GLOW_DURATION);
}

export function originOf(element: Element): DelightOrigin {
  const { left, top, width, height } = element.getBoundingClientRect();
  return { x: left + width / 2, y: top + height / 2, width, height };
}
