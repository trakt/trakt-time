import { describe, expect, it, vi } from 'vitest';
import { openDatePicker } from './openDatePicker.ts';

describe('util: openDatePicker', () => {
  it('should open the native picker', () => {
    const input = document.createElement('input');
    input.showPicker = vi.fn();

    openDatePicker(input);

    expect(input.showPicker).toHaveBeenCalled();
  });

  it('should focus the input when the picker is refused', () => {
    const input = document.createElement('input');
    document.body.append(input);
    input.showPicker = () => {
      throw new DOMException('', 'NotAllowedError');
    };

    openDatePicker(input);

    expect(document.activeElement).toBe(input);
    input.remove();
  });

  it('should focus the input when the browser has no picker', () => {
    const input = document.createElement('input');
    document.body.append(input);
    Object.defineProperty(input, 'showPicker', { value: undefined });

    openDatePicker(input);

    expect(document.activeElement).toBe(input);
    input.remove();
  });
});
