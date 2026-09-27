import { animate } from './_internal/motion.ts';
import { celebrate } from './celebrate.ts';
import RingPulse from './effects/RingPulse.svelte';

const SPRING = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

export function tickAndRing(button: HTMLElement) {
  animate(
    button,
    [
      { transform: 'scale(0.8)' },
      { transform: 'scale(1.12)' },
      { transform: 'scale(1)' },
    ],
    { duration: 380, easing: SPRING },
  );

  const icon = button.querySelector('svg');
  if (icon) {
    animate(
      icon,
      [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
      { duration: 300, delay: 80, easing: 'ease-out', fill: 'backwards' },
    );
  }

  celebrate({ effect: RingPulse, at: button, haptic: 6 });
}
