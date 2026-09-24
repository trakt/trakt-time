import { describe, expect, it } from 'vitest';
import { toWhereToWatchServices } from './toWhereToWatchServices.ts';

const link = 'https://example.com/watch' as HttpsUrl;

describe('toWhereToWatchServices', () => {
  it('lists streaming, free, then on-demand offers once per service', () => {
    const services = toWhereToWatchServices({
      options: {
        streaming: [{
          type: 'streaming',
          source: 'netflix',
          link,
          is4k: true,
          key: 'streaming-netflix',
        }],
        free: [{
          type: 'free',
          source: 'tubi',
          link,
          is4k: false,
          key: 'free-tubi',
        }],
        onDemand: [
          {
            type: 'on-demand',
            source: 'netflix',
            link,
            is4k: false,
            prices: {},
            key: 'on-demand-netflix',
          },
          {
            type: 'on-demand',
            source: 'apple_tv',
            link,
            is4k: false,
            prices: { rent: 3.99 },
            key: 'on-demand-apple_tv',
          },
        ],
      },
      sources: [{
        source: 'netflix',
        name: 'Netflix',
        isFree: false,
        logoUrl: 'https://example.com/netflix.png' as HttpsUrl,
        color: '#e50914',
      }],
    });

    expect(services.map((service) => service.key)).toEqual([
      'streaming-netflix',
      'free-tubi',
      'on-demand-apple_tv',
    ]);
    expect(services[0]).toMatchObject({
      name: 'Netflix',
      logoUrl: 'https://example.com/netflix.png',
      color: '#e50914',
    });
    expect(services[1]).toMatchObject({ name: 'tubi', logoUrl: null });
  });
});
