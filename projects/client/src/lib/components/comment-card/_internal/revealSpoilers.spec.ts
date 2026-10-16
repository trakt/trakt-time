import { afterEach, describe, expect, it } from 'vitest';
import { revealSpoilers } from './revealSpoilers.ts';

function setup(html: string) {
  const node = document.createElement('div');
  node.innerHTML = html;
  document.body.append(node);
  revealSpoilers(node);

  return node;
}

function isHidden(node: HTMLElement, selector: string) {
  return node.querySelector(selector)?.classList.contains('trakt-spoiler');
}

describe('revealSpoilers', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should reveal the clicked spoiler only', () => {
    const node = setup(
      '<span class="trakt-spoiler first">a</span><span class="trakt-spoiler second">b</span>',
    );

    node.querySelector<HTMLElement>('.first')?.click();

    expect(isHidden(node, '.first')).toBe(false);
    expect(isHidden(node, '.second')).toBe(true);
  });

  it('should reveal a spoiler when a nested element is clicked', () => {
    const node = setup(
      '<span class="trakt-spoiler outer"><strong class="inner">a</strong></span>',
    );

    node.querySelector<HTMLElement>('.inner')?.click();

    expect(isHidden(node, '.outer')).toBe(false);
  });

  it('should ignore clicks outside a spoiler', () => {
    const node = setup('<span class="plain">a</span>');

    node.querySelector<HTMLElement>('.plain')?.click();

    expect(node.querySelector('.plain')).not.toBeNull();
  });
});
