import type { MediaReaction } from '$lib/requests/models/MediaReaction.ts';

export type ReactionsSheetProps = {
  chosen: ReadonlyArray<MediaReaction>;
  onSelect: (reaction: MediaReaction) => void;
  onClose: () => void;
};
