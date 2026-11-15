import { describe, expect, it } from 'vitest';
import { toCommentWatchProps } from './toCommentWatchProps.ts';

const base = { slug: 'heretic', mediaId: 42, mediaTitle: 'Heretic' };

describe('toCommentWatchProps', () => {
  it('should scope a movie comment to the movie', () => {
    expect(toCommentWatchProps({ ...base, type: 'movie' })).to.deep.equal({
      type: 'movie',
      media: { id: 42 },
    });
  });

  it('should scope a show comment to the show with its episode count', () => {
    expect(
      toCommentWatchProps({ ...base, type: 'show', episodeCount: 24 }),
    ).to.deep.equal({
      type: 'show',
      media: { id: 42, episode: { count: 24 } },
    });
  });

  it('should leave the episode count out of a show until it is known', () => {
    expect(toCommentWatchProps({ ...base, type: 'show' })).to.deep.equal({
      type: 'show',
      media: { id: 42, episode: undefined },
    });
  });

  it('should scope an episode comment to that episode of its show', () => {
    expect(
      toCommentWatchProps({
        ...base,
        type: 'episode',
        season: 2,
        episode: 3,
        show: { id: 7, title: 'Severance' },
      }),
    ).to.deep.equal({
      type: 'episode',
      media: { id: 42, season: 2, number: 3 },
      show: { id: 7, title: 'Severance' },
    });
  });

  it('should fall back to an unknown show while the show is still loading', () => {
    const result = toCommentWatchProps({
      ...base,
      type: 'episode',
      season: 2,
      episode: 3,
    });

    expect(result.type === 'episode' && result.show.id).toBe(-1);
  });
});
