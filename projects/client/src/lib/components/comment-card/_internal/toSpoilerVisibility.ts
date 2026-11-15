type SpoilerVisibilityProps = {
  isSpoiler: boolean;
  isWatched: boolean;
  isRevealed: boolean;
};

export function toSpoilerVisibility({
  isSpoiler,
  isWatched,
  isRevealed,
}: SpoilerVisibilityProps) {
  return {
    isBlurred: isSpoiler && !isWatched && !isRevealed,
    showInlineSpoilers: isSpoiler || isWatched,
  };
}
