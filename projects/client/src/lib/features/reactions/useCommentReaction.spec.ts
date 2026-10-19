import { reactCommentRequest } from '$lib/requests/queries/comments/reactCommentRequest.ts';
import { removeReactionCommentRequest } from '$lib/requests/queries/comments/removeReactionCommentRequest.ts';
import { BehaviorSubject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCommentReaction } from './useCommentReaction.ts';

const { reactions, invalidate, track } = vi.hoisted(() => ({
  reactions: { value: null as unknown },
  invalidate: vi.fn(),
  track: vi.fn(),
}));

vi.mock('$lib/features/auth/stores/useUser.ts', () => ({
  useUser: () => ({ reactions: reactions.value }),
}));
vi.mock('$lib/features/query/useQuery.ts', () => ({
  useQuery: () => of({ data: undefined }),
}));
vi.mock('$lib/stores/useInvalidator.ts', () => ({
  useInvalidator: () => ({ invalidate }),
}));
vi.mock('$lib/features/analytics/useTrack.ts', () => ({
  useTrack: () => ({ track }),
}));
vi.mock(
  '$lib/requests/queries/comments/reactCommentRequest.ts',
  () => ({ reactCommentRequest: vi.fn() }),
);
vi.mock(
  '$lib/requests/queries/comments/removeReactionCommentRequest.ts',
  () => ({ removeReactionCommentRequest: vi.fn() }),
);

const COMMENT_ID = 7;

describe('useCommentReaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reactions.value = new BehaviorSubject(new Map());
    invalidate.mockResolvedValue(true);
    vi.mocked(removeReactionCommentRequest).mockResolvedValue(true);
    vi.mocked(reactCommentRequest).mockResolvedValue(true);
  });

  it('should only send the reaction when there is no current one', async () => {
    const { react } = useCommentReaction({ id: COMMENT_ID });

    await react('love');

    expect(removeReactionCommentRequest).not.toHaveBeenCalled();
    expect(reactCommentRequest).toHaveBeenCalledWith({
      id: COMMENT_ID,
      reaction_type: 'love',
    });
    expect(invalidate).toHaveBeenCalledOnce();
  });

  it('should remove the current reaction before sending a new one', async () => {
    reactions.value = new BehaviorSubject(
      new Map([[COMMENT_ID, { id: COMMENT_ID, reaction: 'like' }]]),
    );
    const { react } = useCommentReaction({ id: COMMENT_ID });

    await react('love');

    expect(removeReactionCommentRequest).toHaveBeenCalledOnce();
    expect(
      vi.mocked(removeReactionCommentRequest).mock.invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(reactCommentRequest).mock.invocationCallOrder[0],
    );
  });

  it('should still remove first while the reactions have not loaded', async () => {
    reactions.value = new BehaviorSubject(undefined);
    const { react } = useCommentReaction({ id: COMMENT_ID });

    await react('love');

    expect(removeReactionCommentRequest).toHaveBeenCalledOnce();
  });

  it('should flag the pending state while reacting', async () => {
    const { react, isReacting } = useCommentReaction({ id: COMMENT_ID });
    const states: boolean[] = [];
    isReacting.subscribe((value) => states.push(value));

    await react('love');

    expect(states).toEqual([false, true, false]);
  });
});
