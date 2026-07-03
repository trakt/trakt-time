import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const T0 = 1_700_000_000_000;
const T1 = 1_700_000_060_000;

async function importMarker() {
  return await import('./Marker.ts');
}

describe('Marker', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('$app/environment', () => ({ browser: true }));
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(T0);
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('returns the module load time when no marker is stored', async () => {
    const { getMarker } = await importMarker();

    expect(getMarker('invalidate:auth')).toBe(T0);
  });

  it('returns the stored time after setting a marker', async () => {
    const { getMarker, setMarker } = await importMarker();

    vi.setSystemTime(T1);
    setMarker('invalidate:check_in');

    expect(getMarker('invalidate:check_in')).toBe(T1);
  });

  it('keeps markers isolated per action', async () => {
    const { getMarker, setMarker } = await importMarker();

    vi.setSystemTime(T1);
    setMarker('invalidate:check_in');

    expect(getMarker('invalidate:auth')).toBe(T0);
  });

  it('falls back to the default marker for corrupted values', async () => {
    const { getMarker } = await importMarker();

    localStorage.setItem('trakt-marker:invalidate:auth', 'not-a-number');

    expect(getMarker('invalidate:auth')).toBe(T0);
  });
});
