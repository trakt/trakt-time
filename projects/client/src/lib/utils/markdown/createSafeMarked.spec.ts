import { describe, expect, it } from 'vitest';
import { createSafeMarked } from './createSafeMarked.ts';

const toDom = (html: string) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
};

describe('createSafeMarked', () => {
  it('should escape raw html', () => {
    const html = createSafeMarked().parse('<img src=x onerror=alert(1)>', {
      async: false,
    });

    expect(toDom(html).querySelector('img')).toBeNull();
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('should build no anchor for an unsafe protocol', () => {
    const container = toDom(
      createSafeMarked().parseInline('[click](javascript:alert(1))', {
        async: false,
      }),
    );

    expect(container.querySelector('a')).toBeNull();
    expect(container.textContent).toContain('click');
  });

  it('should render a relative link', () => {
    const container = toDom(
      createSafeMarked().parseInline('[ok](/people/tom-hanks)', {
        async: false,
      }),
    );

    expect(container.querySelector('a')).toHaveAttribute(
      'href',
      '/people/tom-hanks',
    );
  });
});
