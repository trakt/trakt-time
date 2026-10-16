import { rawApiFetch } from '$lib/requests/api.ts';
import { describe, expect, it, vi } from 'vitest';
import {
  mapToMediaReactionSummary,
  mediaReactionsSummaryQuery,
} from './mediaReactionsSummaryQuery.ts';

vi.mock('$lib/requests/api.ts', () => ({ rawApiFetch: vi.fn() }));

const RESPONSE = {
  reaction_count: 25,
  user_count: 18,
  distribution: { shocked: 12, mind_blown: 7, fire: 4, thinking: 2 },
};

describe('mediaReactionsSummaryQuery', () => {
  it('should map the counts and rank the top three', () => {
    const summary = mapToMediaReactionSummary(RESPONSE);

    expect(summary.totalCount).toBe(25);
    expect(summary.top).toEqual(['shocked', 'mind_blown', 'fire']);
    expect(summary.distribution.thinking).toBe(2);
    expect(summary.distribution.love).toBe(0);
  });

  it('should query the reactions summary of a movie', async () => {
    vi.mocked(rawApiFetch).mockResolvedValue(Response.json(RESPONSE));

    const result = await mediaReactionsSummaryQuery({
      type: 'movie',
      slug: 'heretic-2024',
    }).execute();

    expect(rawApiFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/v3/movies/heretic-2024/reactions/summary',
      }),
    );
    expect(result?.totalCount).toBe(25);
  });

  it('should report no reactions when the summary is unavailable', async () => {
    vi.mocked(rawApiFetch).mockResolvedValue(
      new Response(null, { status: 404 }),
    );

    const result = await mediaReactionsSummaryQuery({
      type: 'show',
      slug: 'severance',
    }).execute();

    expect(result).toMatchObject({ totalCount: 0, top: [] });
  });
});
