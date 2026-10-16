export function toBody(node: HTMLElement) {
  document.body.appendChild(node);

  return { destroy: () => node.remove() };
}
