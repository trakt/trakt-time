import type { SectionHeader } from './sectionHeaderContext.svelte.ts';

export function trackWeekTitle(node: HTMLElement, header?: SectionHeader) {
  let frame = 0;
  let current = header;

  function update() {
    frame = 0;
    if (!current) return;

    const height = current.height;
    const passed = [...node.querySelectorAll<HTMLElement>('[data-week-title]')]
      .filter((title) => title.getClientRects().length > 0)
      .filter((title) => title.getBoundingClientRect().bottom <= height);

    current.title = passed.at(-1)?.textContent ?? null;
  }

  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();

  return {
    update(next?: SectionHeader) {
      current = next;
      update();
    },
    destroy() {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (current) current.title = null;
    },
  };
}
