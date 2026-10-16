import { rawApiFetch } from '$lib/requests/api.ts';
import { describe, expect, it, vi } from 'vitest';
import {
  mapToUserMediaReactions,
  userMediaReactionsQuery,
} from './userMediaReactionsQuery.ts';

vi.mock('$lib/requests/api.ts', () => ({ rawApiFetch: vi.fn() }));

const RESPONSE = [
  { id: 482, reaction: { type: 'shocked', emoji: '😱' } },
  { id: 483, reaction: { type: 'laugh', emoji: '😂' } },
];

describe('userMediaReactionsQuery', () => {
  it('should drop reactions outside the media taxonomy', () => {
    expect(mapToUserMediaReactions(RESPONSE)).toEqual([
      { id: 482, reaction: 'shocked' },
    ]);
  });

  it('should query the reactions of the current user for a movie', async () => {
    vi.mocked(rawApiFetch).mockResolvedValue(Response.json(RESPONSE));

    const result = await userMediaReactionsQuery({
      type: 'movie',
      id: 1,
      enabled: true,
    }).execute();

    expect(rawApiFetch).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/v3/users/me/movie/1' }),
    );
    expect(result).toEqual([{ id: 482, reaction: 'shocked' }]);
  });

  it('should report no reactions when the request fails', async () => {
    vi.mocked(rawApiFetch).mockResolvedValue(
      new Response(null, { status: 401 }),
    );

    const result = await userMediaReactionsQuery({
      type: 'show',
      id: 2,
      enabled: true,
    }).execute();

    expect(result).toEqual([]);
  });
});
