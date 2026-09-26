import * as m from '$lib/paraglide/messages.js';
import type { Reaction } from '$lib/requests/queries/comments/commentReactionsQuery.ts';

const LABELS: Record<Reaction, () => string> = {
  like: m.translated_value_reaction_like,
  dislike: m.translated_value_reaction_dislike,
  love: m.translated_value_reaction_love,
  laugh: m.translated_value_reaction_laugh,
  shocked: m.translated_value_reaction_shocked,
  bravo: m.translated_value_reaction_bravo,
  spoiler: m.translated_value_reaction_spoiler,
};

export function toReactionLabel(reaction: Reaction): string {
  return LABELS[reaction]();
}
