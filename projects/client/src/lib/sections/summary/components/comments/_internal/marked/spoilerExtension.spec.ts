import { Marked } from 'marked';
import { describe, expect, it } from 'vitest';
import {
  matchSpoilerTag,
  spoilerExtension,
  spoilerRenderer,
} from './spoilerExtension.ts';

function render(source: string, isCommentSpoiler = false) {
  const container = document.createElement('div');
  container.innerHTML = new Marked({
    extensions: [spoilerExtension(isCommentSpoiler)],
  }).parse(source, { gfm: true, breaks: true }) as string;

  return container;
}

describe('spoilerExtension', () => {
  it('should match a spoiler tag', () => {
    expect(matchSpoilerTag('[spoiler]test[/spoiler]')?.[1]).toBe('test');
  });

  it('should not match without a closing tag', () => {
    expect(matchSpoilerTag('[spoiler]test')).toBeNull();
  });

  it('should render a hidden spoiler span', () => {
    expect(spoilerRenderer('test', false)).toBe(
      '<span class="trakt-spoiler">test</span>',
    );
  });

  it('should render a plain span when the whole comment is a spoiler', () => {
    expect(spoilerRenderer('test', true)).toBe('<span>test</span>');
  });

  it.each([
    ['in a paragraph', 'a [spoiler]hidden[/spoiler] b'],
    ['wrapped in bold', '**[spoiler]hidden[/spoiler]**'],
    ['wrapped in italic', '*[spoiler]hidden[/spoiler]*'],
    ['inside a list item', '- [spoiler]hidden[/spoiler]'],
  ])('should hide a spoiler %s', (_, source) => {
    expect(render(source).querySelector('.trakt-spoiler')?.textContent).toBe(
      'hidden',
    );
  });

  it('should not hide inline spoilers of a spoiler comment', () => {
    expect(render('[spoiler]hidden[/spoiler]', true).innerHTML).not.toContain(
      'trakt-spoiler',
    );
  });
});
