import type { Component } from 'svelte';
import {
  glow,
  originOf,
  prefersReducedMotion,
  vibrate,
} from './_internal/motion.ts';
import { type EffectProps, playEffect } from './_internal/playEffect.ts';
import type { DelightOrigin } from './models/DelightOrigin.ts';

type OriginProps = EffectProps & { origin: DelightOrigin };

type CelebrateParams<P extends OriginProps> = {
  effect: Component<P>;
  at: Element;
  props?: Omit<P, 'onDone' | 'origin'>;
  haptic?: number | number[];
};

export function celebrate<P extends OriginProps>(
  { effect, at, props, haptic = 8 }: CelebrateParams<P>,
) {
  vibrate(haptic);

  if (prefersReducedMotion()) {
    glow(at);
    return;
  }

  playEffect(effect, { ...props, origin: originOf(at) } as Omit<P, 'onDone'>);
}
