import { describe, expect, it } from 'vitest';
import { isCrawlerRequest } from './isCrawlerRequest.ts';

describe('isCrawlerRequest', () => {
  it('should detect verified search engine bots', () => {
    expect(
      isCrawlerRequest({ userAgent: 'Mozilla/5.0', isLegitimateBot: true }),
    ).toBe(true);
  });

  it('should detect link preview bots by user agent', () => {
    expect(
      isCrawlerRequest({
        userAgent: 'Slackbot-LinkExpanding 1.0',
        isLegitimateBot: false,
      }),
    ).toBe(true);
  });

  it('should not treat regular browsers as crawlers', () => {
    expect(
      isCrawlerRequest({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) Safari/604.1',
        isLegitimateBot: false,
      }),
    ).toBe(false);
  });

  it('should handle a missing user agent', () => {
    expect(isCrawlerRequest({ userAgent: null, isLegitimateBot: false })).toBe(
      false,
    );
  });
});
