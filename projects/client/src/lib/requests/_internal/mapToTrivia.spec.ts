import { describe, expect, it } from 'vitest';
import type { TriviaResponse } from '../models/TriviaResponse.ts';
import { mapToTrivia } from './mapToTrivia.ts';

describe('mapToTrivia', () => {
  it('should point person links at the local routes', () => {
    const entry: TriviaResponse['items'][0] = {
      fact_id: 'a',
      order: 1,
      category: 'cast_n_crew',
      spoiler: false,
      text: '[Tom Hanks](https://app.trakt.tv/people/tom-hanks) improvised it.',
    };

    expect(mapToTrivia('movie_trivia', entry).text).toBe(
      '[Tom Hanks](/people/tom-hanks) improvised it.',
    );
  });
});
