type Box = { top: number; bottom: number; left: number };
type Size = { width: number; height: number };

type ToPopupPositionParams = {
  trigger: Box;
  viewport: Size;
  panelWidth: number;
  reserve: number;
  margin: number;
  gap: number;
};

export type PopupPosition = {
  placement: 'top' | 'bottom';
  left: number;
  width: number;
  edge: number;
};

export function toPopupPosition({
  trigger,
  viewport,
  panelWidth,
  reserve,
  margin,
  gap,
}: ToPopupPositionParams): PopupPosition {
  const width = Math.min(panelWidth, viewport.width - margin * 2);
  const left = Math.max(
    margin,
    Math.min(trigger.left, viewport.width - margin - width),
  );

  const spaceBelow = viewport.height - trigger.bottom;
  const spaceAbove = trigger.top;
  const placement =
    spaceBelow >= reserve + gap || spaceBelow >= spaceAbove ? 'bottom' : 'top';

  return {
    placement,
    left,
    width,
    edge:
      placement === 'bottom'
        ? trigger.bottom + gap
        : viewport.height - trigger.top + gap,
  };
}
