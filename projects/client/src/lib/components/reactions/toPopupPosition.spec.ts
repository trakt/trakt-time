import { describe, expect, it } from 'vitest';
import { toPopupPosition } from './toPopupPosition.ts';

const base = {
  viewport: { width: 390, height: 800 },
  panelWidth: 340,
  reserve: 292,
  margin: 16,
  gap: 8,
};

describe('util: toPopupPosition', () => {
  it('should open below the trigger when the panel fits', () => {
    const position = toPopupPosition({
      ...base,
      trigger: { top: 200, bottom: 236, left: 16 },
    });

    expect(position).toEqual({
      placement: 'bottom',
      left: 16,
      width: 340,
      edge: 244,
    });
  });

  it('should open above the trigger near the bottom edge', () => {
    const position = toPopupPosition({
      ...base,
      trigger: { top: 700, bottom: 736, left: 16 },
    });

    expect(position.placement).toBe('top');
    expect(position.edge).toBe(108);
  });

  it('should keep the panel inside the viewport horizontally', () => {
    const position = toPopupPosition({
      ...base,
      trigger: { top: 200, bottom: 236, left: 300 },
    });

    expect(position.left).toBe(34);
  });

  it('should shrink the panel on a narrow viewport', () => {
    const position = toPopupPosition({
      ...base,
      viewport: { width: 320, height: 800 },
      trigger: { top: 200, bottom: 236, left: 16 },
    });

    expect(position.width).toBe(288);
  });
});
