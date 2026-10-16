export const SPOILER_CLASS_NAME = 'trakt-spoiler';

export function revealSpoilers(node: HTMLElement) {
  function handleClick(event: MouseEvent) {
    if (!(event.target instanceof Element)) return;

    const spoiler = event.target.closest(`.${SPOILER_CLASS_NAME}`);
    if (!spoiler || !node.contains(spoiler)) return;

    event.preventDefault();
    spoiler.classList.remove(SPOILER_CLASS_NAME);
  }

  node.addEventListener('click', handleClick);

  return {
    destroy() {
      node.removeEventListener('click', handleClick);
    },
  };
}
