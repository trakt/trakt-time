import { describe, expect, it } from 'vitest';
import { toPeopleTab } from './toPeopleTab.ts';

describe('toPeopleTab', () => {
  it('defaults to following', () => {
    expect(toPeopleTab({ value: null, isOwner: false })).toBe('following');
    expect(toPeopleTab({ value: 'nonsense', isOwner: true })).toBe(
      'following',
    );
  });

  it('opens followers for anyone', () => {
    expect(toPeopleTab({ value: 'followers', isOwner: false })).toBe(
      'followers',
    );
  });

  it('only opens requests for the owner', () => {
    expect(toPeopleTab({ value: 'requests', isOwner: true })).toBe('requests');
    expect(toPeopleTab({ value: 'requests', isOwner: false })).toBe(
      'following',
    );
  });
});
