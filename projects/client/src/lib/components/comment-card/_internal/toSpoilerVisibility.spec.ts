import { describe, expect, it } from 'vitest';
import { toSpoilerVisibility } from './toSpoilerVisibility.ts';

describe('toSpoilerVisibility', () => {
  it('should blur a spoiler comment the viewer has not watched', () => {
    expect(
      toSpoilerVisibility({
        isSpoiler: true,
        isWatched: false,
        isRevealed: false,
      }).isBlurred,
    ).toBe(true);
  });

  it('should not blur a spoiler comment once it is watched', () => {
    expect(
      toSpoilerVisibility({
        isSpoiler: true,
        isWatched: true,
        isRevealed: false,
      }).isBlurred,
    ).toBe(false);
  });

  it('should not blur a spoiler comment the viewer revealed', () => {
    expect(
      toSpoilerVisibility({
        isSpoiler: true,
        isWatched: false,
        isRevealed: true,
      }).isBlurred,
    ).toBe(false);
  });

  it('should never blur a comment that is not marked as a spoiler', () => {
    expect(
      toSpoilerVisibility({
        isSpoiler: false,
        isWatched: false,
        isRevealed: false,
      }).isBlurred,
    ).toBe(false);
  });

  it('should keep inline spoilers hidden on an unwatched plain comment', () => {
    expect(
      toSpoilerVisibility({
        isSpoiler: false,
        isWatched: false,
        isRevealed: false,
      }).showInlineSpoilers,
    ).toBe(false);
  });

  it('should show inline spoilers once watched', () => {
    expect(
      toSpoilerVisibility({
        isSpoiler: false,
        isWatched: true,
        isRevealed: false,
      }).showInlineSpoilers,
    ).toBe(true);
  });

  it('should show inline spoilers inside a spoiler comment', () => {
    expect(
      toSpoilerVisibility({
        isSpoiler: true,
        isWatched: false,
        isRevealed: false,
      }).showInlineSpoilers,
    ).toBe(true);
  });
});
