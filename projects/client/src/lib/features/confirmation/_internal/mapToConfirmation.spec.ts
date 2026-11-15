import { describe, expect, it } from 'vitest';
import { ConfirmationType } from '../models/ConfirmationType.ts';
import { mapToConfirmation } from './mapToConfirmation.ts';

describe('mapToConfirmation', () => {
  it('should offer to keep editing when discarding changes', () => {
    const result = mapToConfirmation({
      type: ConfirmationType.DiscardChanges,
    });

    expect(result.operation).toBe('destructive');
    expect(result.buttonText).toBe('Discard');
    expect(result.cancelText).toBe('Keep editing');
    expect(result.message).toBeTruthy();
  });

  it('should leave the cancel label to the dialog default for other types', () => {
    const result = mapToConfirmation({ type: ConfirmationType.DeleteComment });

    expect(result.cancelText).toBeUndefined();
  });
});
