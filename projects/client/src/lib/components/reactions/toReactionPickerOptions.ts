import type { MediaReaction } from '$lib/requests/models/MediaReaction.ts';
import { toTranslatedReaction } from '$lib/utils/formatting/string/toTranslatedReaction.ts';
import { REACTIONS_CODE_MAP } from './constants.ts';
import type { ReactionPickerOption } from './ReactionPickerOption.ts';

export function toReactionPickerOptions(
  reactions: ReadonlyArray<MediaReaction>,
): ReadonlyArray<ReactionPickerOption<MediaReaction>> {
  return reactions.map((reaction) => ({
    id: reaction,
    label: toTranslatedReaction(reaction),
    code: REACTIONS_CODE_MAP[reaction],
  }));
}
