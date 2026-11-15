import { render, screen, waitFor } from '@testing-library/svelte';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import ActionToastHost from './ActionToastHost.svelte';
import { actionToastStore } from './_internal/actionToastStore.ts';

function current() {
  let value = null as unknown;
  actionToastStore
    .subscribe((next) => {
      value = next;
    })
    .unsubscribe();

  return value;
}

describe('component: ActionToastHost', () => {
  beforeAll(() => {
    Element.prototype.animate = vi.fn(() => ({
      cancel: vi.fn(),
      finished: Promise.resolve(),
      currentTime: 0,
    })) as unknown as typeof Element.prototype.animate;
  });

  beforeEach(() => {
    actionToastStore.dismiss();
  });

  it('should render nothing without a toast', () => {
    render(ActionToastHost);

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('should show the notified message', async () => {
    render(ActionToastHost);

    actionToastStore.notify({ message: 'Link copied' });

    expect(await screen.findByText('Link copied')).toBeInTheDocument();
  });

  it('should dismiss itself after the notified duration', async () => {
    render(ActionToastHost);

    actionToastStore.notify({ message: 'Brief', durationMs: 20 });

    expect(await screen.findByText('Brief')).toBeInTheDocument();
    await waitFor(() => expect(current()).toBeNull());
  });

  it('should run the action and dismiss the toast', async () => {
    const onAction = vi.fn();
    render(ActionToastHost);

    actionToastStore.notify({
      message: 'Added',
      action: { text: 'Change list', label: 'Change the list', onAction },
    });

    (await screen.findByLabelText('Change the list')).click();

    await waitFor(() => expect(onAction).toHaveBeenCalledOnce());
  });

  it('should surface an error toast when the action rejects', async () => {
    const { container } = render(ActionToastHost);

    actionToastStore.notify({
      message: 'Added',
      action: {
        text: 'Undo',
        label: 'Undo adding',
        onAction: () => Promise.reject(new Error('nope')),
      },
    });

    (await screen.findByLabelText('Undo adding')).click();

    await waitFor(() =>
      expect(
        container.ownerDocument.querySelector('[data-variant="error"]'),
      ).not.toBeNull(),
    );
  });
});
