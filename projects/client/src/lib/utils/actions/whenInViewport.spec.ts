import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { whenInViewport } from './whenInViewport.ts';

type Observer = {
  readonly observed: Set<Element>;
  fire: (target: Element) => void;
};

describe('action: whenInViewport', () => {
  let observers: Observer[];

  beforeEach(() => {
    observers = [];
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        readonly #callback: IntersectionObserverCallback;
        readonly #observed = new Set<Element>();

        constructor(callback: IntersectionObserverCallback) {
          this.#callback = callback;
          observers.push({
            observed: this.#observed,
            fire: (target) =>
              this.#callback(
                [{ isIntersecting: true, target } as IntersectionObserverEntry],
                this as unknown as IntersectionObserver,
              ),
          });
        }
        observe(target: Element) {
          this.#observed.add(target);
        }
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should call a plain callback once the element intersects', () => {
    const element = document.createElement('div');
    const callback = vi.fn<() => void>();

    whenInViewport(element, callback);
    expect(callback).not.toHaveBeenCalled();
    observers.at(0)?.fire(element);

    expect(callback).toHaveBeenCalledOnce();
  });

  it('should call an options callback once the element intersects', () => {
    const element = document.createElement('div');
    const callback = vi.fn<() => void>();

    whenInViewport(element, { callback, requiresObserver: true });
    observers.at(0)?.fire(element);

    expect(callback).toHaveBeenCalledOnce();
  });

  it('should call the callback right away when IntersectionObserver is missing', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const callback = vi.fn<() => void>();

    const action = whenInViewport(document.createElement('div'), callback);

    expect(callback).toHaveBeenCalledOnce();
    expect(() => action?.destroy?.()).not.toThrow();
  });

  it('should skip a callback that requires the observer when IntersectionObserver is missing', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const callback = vi.fn<() => void>();

    whenInViewport(document.createElement('div'), {
      callback,
      requiresObserver: true,
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
