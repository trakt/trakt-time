import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { appendGlobalParameters } from './appendGlobalParameters.ts';

const search = new BehaviorSubject(new URLSearchParams());
const override = new BehaviorSubject('');
const isEscaped = new BehaviorSubject(false);

vi.mock('./useParameters.ts', () => ({
  useParameters: () => ({ search, override, isEscaped }),
}));

function makeAnchor(href: string): HTMLAnchorElement {
  const anchor = document.createElement('a');
  anchor.setAttribute('href', href);
  document.body.appendChild(anchor);
  return anchor;
}

describe('appendGlobalParameters', () => {
  afterEach(() => {
    document.body.replaceChildren();
    search.next(new URLSearchParams());
  });

  it('appends the live parameters to the href', () => {
    search.next(new URLSearchParams({ mode: 'movie' }));
    const anchor = makeAnchor('/profile/userA');

    const action = appendGlobalParameters(anchor, '/profile/userA');

    expect(anchor.getAttribute('href')).toBe('/profile/userA?mode=movie');
    action.destroy();
  });

  it('does not rewrite the href when the computed value is unchanged', () => {
    const anchor = makeAnchor('/profile/userA?page=2');
    const action = appendGlobalParameters(anchor, '/profile/userA?page=2');
    const setHref = vi.spyOn(HTMLAnchorElement.prototype, 'href', 'set');

    action.update('/profile/userA?page=2');
    search.next(new URLSearchParams());

    expect(setHref).not.toHaveBeenCalled();
    setHref.mockRestore();
    action.destroy();
  });

  it('rewrites the href when the computed value changes', () => {
    const anchor = makeAnchor('/profile/userA');
    const action = appendGlobalParameters(anchor, '/profile/userA');

    search.next(new URLSearchParams({ mode: 'show' }));

    expect(anchor.getAttribute('href')).toBe('/profile/userA?mode=show');
    action.destroy();
  });
});
