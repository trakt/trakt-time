import { afterEach, describe, expect, it, vi } from 'vitest';
import { withSignal } from './withSignal.ts';

const originalAny = AbortSignal.any;

function setAbortSignalAny(value: typeof AbortSignal.any | undefined) {
  Object.defineProperty(AbortSignal, 'any', { value, configurable: true });
}

describe('withSignal', () => {
  afterEach(() => {
    setAbortSignalAny(originalAny);
    vi.unstubAllGlobals();
  });

  it('should pass the term signal when the caller passes none', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response());
    vi.stubGlobal('fetch', fetchSpy);
    const term = new AbortController();

    await withSignal(term.signal)('https://example.com');

    expect(fetchSpy.mock.calls[0]?.[1]?.signal).toBe(term.signal);
  });

  it('should fall back to the term signal when AbortSignal.any is missing', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response());
    vi.stubGlobal('fetch', fetchSpy);
    setAbortSignalAny(undefined);
    const term = new AbortController();
    const caller = new AbortController();

    await withSignal(term.signal)('https://example.com', {
      signal: caller.signal,
    });

    expect(fetchSpy.mock.calls[0]?.[1]?.signal).toBe(term.signal);
  });
});
