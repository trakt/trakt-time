import { prefersReducedMotion } from './_internal/motion.ts';
import { easeOutCubic } from './delightRules.ts';

type CountUpParams = {
  to: number;
  duration: number;
  onUpdate: (value: number) => void;
};

export function countUp(
  { to, duration, onUpdate }: CountUpParams,
): Promise<void> {
  if (prefersReducedMotion()) {
    onUpdate(to);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = (now - start) / duration;
      onUpdate(Math.round(to * easeOutCubic(progress)));
      if (progress < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}
