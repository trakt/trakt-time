export type LinkParts = {
  before: string;
  label: string | null;
  after: string;
};

const LINK_PATTERN = /^(.*?)<a>(.*?)<\/a>(.*)$/s;

export function toLinkParts(text: string): LinkParts {
  const match = LINK_PATTERN.exec(text);
  if (!match) return { before: text, label: null, after: '' };

  const [, before = '', label = '', after = ''] = match;
  return { before, label, after };
}
