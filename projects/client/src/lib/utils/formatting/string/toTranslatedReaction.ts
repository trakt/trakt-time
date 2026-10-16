import * as m from '$lib/paraglide/messages.js';
import type { MediaReaction } from '$lib/requests/models/MediaReaction.ts';

const REACTION_MAP = {
  like: m.translated_value_reaction_like,
  dislike: m.translated_value_reaction_dislike,
  love: m.translated_value_reaction_love,
  shocked: m.translated_value_reaction_shocked,
  bravo: m.translated_value_reaction_bravo,
  spoiler: m.translated_value_reaction_spoiler,
  heart_eyes: m.translated_value_reaction_heart_eyes,
  rofl: m.translated_value_reaction_rofl,
  holding_back_tears: m.translated_value_reaction_holding_back_tears,
  partying: m.translated_value_reaction_partying,
  mind_blown: m.translated_value_reaction_mind_blown,
  cursing: m.translated_value_reaction_cursing,
  weary: m.translated_value_reaction_weary,
  woozy: m.translated_value_reaction_woozy,
  yawning: m.translated_value_reaction_yawning,
  shushing: m.translated_value_reaction_shushing,
  smiling_tear: m.translated_value_reaction_smiling_tear,
  neutral: m.translated_value_reaction_neutral,
  anxious: m.translated_value_reaction_anxious,
  thinking: m.translated_value_reaction_thinking,
  flushed: m.translated_value_reaction_flushed,
  melting: m.translated_value_reaction_melting,
  grimacing: m.translated_value_reaction_grimacing,
  vomiting: m.translated_value_reaction_vomiting,
  eye_roll: m.translated_value_reaction_eye_roll,
  rock_on: m.translated_value_reaction_rock_on,
  skull: m.translated_value_reaction_skull,
  popcorn: m.translated_value_reaction_popcorn,
  fire: m.translated_value_reaction_fire,
  crying: m.translated_value_reaction_crying,
  pinched_fingers: m.translated_value_reaction_pinched_fingers,
  broken_heart: m.translated_value_reaction_broken_heart,
  freezing: m.translated_value_reaction_freezing,
  disguised: m.translated_value_reaction_disguised,
  nerd: m.translated_value_reaction_nerd,
  monocle: m.translated_value_reaction_monocle,
} as const satisfies Record<MediaReaction, () => string>;

export function toTranslatedReaction(reaction: MediaReaction): string {
  return REACTION_MAP[reaction]();
}
