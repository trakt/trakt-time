import { EMOJI_BASE_URL } from './constants.ts';

export function toReactionEmojiUrl(code: string) {
  return `${EMOJI_BASE_URL}/${code}/emoji.svg`;
}
