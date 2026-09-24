import { describe, expect, it } from 'vitest';
import { shouldAutoLoad } from './shouldAutoLoad.ts';

const ready = {
  isEnabled: true,
  isNear: true,
  hasMore: true,
  isLoading: false,
  count: 20,
  stalledAtCount: null,
};

describe('shouldAutoLoad', () => {
  it('loads when the trigger is near and more pages exist', () => {
    expect(shouldAutoLoad(ready)).toBe(true);
  });

  it('waits while disabled, far away, loading or out of pages', () => {
    expect(shouldAutoLoad({ ...ready, isEnabled: false })).toBe(false);
    expect(shouldAutoLoad({ ...ready, isNear: false })).toBe(false);
    expect(shouldAutoLoad({ ...ready, isLoading: true })).toBe(false);
    expect(shouldAutoLoad({ ...ready, hasMore: false })).toBe(false);
  });

  it('stops retrying when the last load added nothing', () => {
    expect(shouldAutoLoad({ ...ready, stalledAtCount: 20 })).toBe(false);
  });

  it('keeps going once the list has grown past the stall', () => {
    expect(shouldAutoLoad({ ...ready, count: 40, stalledAtCount: 20 })).toBe(
      true,
    );
  });
});
