import { type Component, mount, unmount } from 'svelte';

const LAYER_CLASS = 'trakt-delight-layer';

function delightLayer(): HTMLElement {
  const existing = document.querySelector<HTMLElement>(`.${LAYER_CLASS}`);
  if (existing) return existing;

  const layer = document.createElement('div');
  layer.className = LAYER_CLASS;
  layer.setAttribute('aria-hidden', 'true');
  document.body.append(layer);
  return layer;
}

export type EffectProps = { onDone: () => void };

export function playEffect<P extends EffectProps>(
  component: Component<P>,
  props: Omit<P, 'onDone'>,
) {
  const onDone = () => {
    void unmount(instance);
  };
  const instance: Record<string, unknown> = mount(component, {
    target: delightLayer(),
    props: { ...props, onDone } as unknown as P,
  });
}
