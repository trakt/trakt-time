import { describe, expect, it } from 'vitest';
import type { SentimentResponse } from '../models/SentimentResponse.ts';
import { mapToSentimentAnalysis } from './mapToSentimentAnalysis.ts';

describe('mapToSentimentAnalysis', () => {
  it('should point person links in the analysis and highlight at the local routes', () => {
    const response: SentimentResponse = {
      aspect: { pros: [], cons: [] },
      sentiment: {
        overall: 'positive',
        score: 1,
        keywords: { pros: [], cons: [] },
      },
      analysis: 'Led by [Tom Hanks](https://app.trakt.tv/people/tom-hanks).',
      highlight: '[Meg Ryan](https://trakt.tv/people/meg-ryan) shines.',
    };

    const sentiment = mapToSentimentAnalysis(response);

    expect(sentiment?.analysis).toBe('Led by [Tom Hanks](/people/tom-hanks).');
    expect(sentiment?.highlight).toBe('[Meg Ryan](/people/meg-ryan) shines.');
  });

  it('should return nothing without a response', () => {
    expect(mapToSentimentAnalysis(undefined)).toBeNull();
  });
});
