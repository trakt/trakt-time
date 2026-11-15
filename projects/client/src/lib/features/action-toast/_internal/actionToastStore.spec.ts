import { beforeEach, describe, expect, it } from 'vitest';
import type { ActionToast } from '../models/ActionToast.ts';
import { actionToastStore } from './actionToastStore.ts';

function current() {
  let value = null as ActionToast | null;
  actionToastStore
    .subscribe((next) => {
      value = next;
    })
    .unsubscribe();

  return value;
}

describe('actionToastStore', () => {
  beforeEach(() => {
    actionToastStore.dismiss();
  });

  it('should start without a toast', () => {
    expect(current()).toBeNull();
  });

  it('should expose the notified toast with an id', () => {
    actionToastStore.notify({ message: 'hello' });

    expect(current()).toMatchObject({
      message: 'hello',
      id: expect.any(String),
    });
  });

  it('should replace the current toast with a new id', () => {
    actionToastStore.notify({ message: 'first' });
    const first = current();

    actionToastStore.notify({ message: 'second' });
    const second = current();

    expect(second?.message).toBe('second');
    expect(second?.id).not.toBe(first?.id);
  });

  it('should return the id of the notified toast', () => {
    const id = actionToastStore.notify({ message: 'hello' });

    expect(current()?.id).toBe(id);
  });

  it('should keep the duration of the notified toast', () => {
    actionToastStore.notify({ message: 'hello', durationMs: 10_000 });

    expect(current()?.durationMs).toBe(10_000);
  });

  it('should dismiss the toast matching the given id', () => {
    const id = actionToastStore.notify({ message: 'first' });

    actionToastStore.dismiss(id);

    expect(current()).toBeNull();
  });

  it('should keep a newer toast when dismissing an older id', () => {
    const olderId = actionToastStore.notify({ message: 'first' });
    actionToastStore.notify({ message: 'second' });

    actionToastStore.dismiss(olderId);

    expect(current()?.message).toBe('second');
  });

  it('should clear the toast on dismiss', () => {
    actionToastStore.notify({ message: 'hello' });
    actionToastStore.dismiss();

    expect(current()).toBeNull();
  });
});
