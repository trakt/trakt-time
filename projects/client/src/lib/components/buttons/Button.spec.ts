import { GlobalEventBus } from '$lib/utils/events/GlobalEventBus.ts';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import Button from './Button.svelte';
import type { TraktButtonProps } from './TraktButtonProps.ts';

const children = createRawSnippet(() => ({
  render: () => '<span>Test Button</span>',
}));

const defaultProps = { label: 'Test Button', children } as TraktButtonProps;

describe('Button', () => {
  it('should render a button with its label', () => {
    render(Button, { props: defaultProps });

    expect(screen.getByRole('button', { name: 'Test Button' }))
      .toBeInTheDocument();
  });

  it('should call onclick when clicked', async () => {
    const onclick = vi.fn();
    render(Button, { props: { ...defaultProps, onclick } });

    await fireEvent.click(screen.getByRole('button', { name: 'Test Button' }));

    expect(onclick).toHaveBeenCalledTimes(1);
  });

  describe('onclickoutside', () => {
    it('should call onclickoutside when clicking outside', () => {
      const onclickoutside = vi.fn();
      render(Button, { props: { ...defaultProps, onclickoutside } });

      document.body.click();

      expect(onclickoutside).toHaveBeenCalledTimes(1);
    });

    it('should not register global listeners without onclickoutside', () => {
      const register = vi.spyOn(GlobalEventBus.getInstance(), 'register');

      render(Button, { props: defaultProps });

      const registered = register.mock.calls.map(([type]) => type);
      register.mockRestore();

      expect(registered).toEqual([]);
    });
  });
});
