import { toReactionPickerOptions } from '$lib/components/reactions/toReactionPickerOptions.ts';
import { MediaReactionSchema } from '$lib/requests/models/MediaReaction.ts';
import { QUICK_MEDIA_REACTIONS } from '../constants.ts';

export function toMediaReactionOptions() {
  return toReactionPickerOptions([
    ...QUICK_MEDIA_REACTIONS,
    ...MediaReactionSchema.options.filter(
      (reaction) => !QUICK_MEDIA_REACTIONS.includes(reaction),
    ),
  ]);
}
