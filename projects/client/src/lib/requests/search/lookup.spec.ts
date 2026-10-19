import { describe, expect, it, vi } from 'vitest';

const { clientLoaded, perform } = vi.hoisted(() => ({
  clientLoaded: vi.fn(),
  perform: vi.fn(),
}));

vi.mock('./createSearcher.ts', () => {
  clientLoaded();
  return { createSearcher: () => ({ multiSearch: { perform } }) };
});

import { lookup } from './lookup.ts';

describe('lookup', () => {
  it('should not load the search client until a lookup runs', () => {
    expect(clientLoaded).not.toHaveBeenCalled();
  });

  it('should use the exact preset for exact lookups', async () => {
    perform.mockResolvedValue({ hits: [], found: 0 });

    await lookup({
      key: 'key',
      server: 'server',
      query: 'dune',
      limit: 5,
      types: ['movie', 'person'],
      exact: true,
    });

    expect(clientLoaded).toHaveBeenCalledTimes(1);
    expect(perform).toHaveBeenCalledWith(
      {
        searches: [
          { collection: 'Movie', preset: 'search:media:exact' },
          { collection: 'Person', preset: 'search:people' },
        ],
        union: true,
      },
      { q: 'dune', limit: 5 },
      { abortSignal: undefined },
    );
  });

  it('should hand the abort signal to the search client', async () => {
    perform.mockResolvedValue({ hits: [], found: 0 });
    const { signal } = new AbortController();

    await lookup({
      key: 'key',
      server: 'server',
      query: 'dune',
      limit: 5,
      types: ['movie'],
      exact: false,
      signal,
    });

    expect(perform).toHaveBeenCalledWith(
      expect.anything(),
      { q: 'dune', limit: 5 },
      { abortSignal: signal },
    );
  });

  it('should return hits and total, defaulting missing hits to empty', async () => {
    perform.mockResolvedValue({ found: 3 });

    const result = await lookup({
      key: 'key',
      server: 'server',
      query: 'dune',
      limit: 5,
      types: ['show'],
      exact: false,
    });

    expect(result).toEqual({ hits: [], total: 3 });
  });
});
