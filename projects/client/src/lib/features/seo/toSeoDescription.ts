import { SEO_DESCRIPTION_MAX_LENGTH } from './constants.ts';

export function toSeoDescription(
  text: Nil | string,
  maxLength = SEO_DESCRIPTION_MAX_LENGTH,
): string {
  const normalized = (text ?? '').replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;

  const cut = normalized.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const wordSafe = lastSpace > maxLength / 2 ? cut.slice(0, lastSpace) : cut;

  return `${wordSafe.replace(/[\s.,;:!?-]+$/, '')}…`;
}
