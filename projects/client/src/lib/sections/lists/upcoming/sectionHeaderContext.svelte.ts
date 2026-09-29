import { getContext, setContext } from 'svelte';

export type SectionHeader = {
  height: number;
  title: string | null;
};

const SECTION_HEADER_KEY = Symbol('section-header');

export function provideSectionHeader(): SectionHeader {
  const header = $state<SectionHeader>({ height: 0, title: null });

  return setContext(SECTION_HEADER_KEY, header);
}

export function useSectionHeader(): SectionHeader | undefined {
  return getContext<SectionHeader | undefined>(SECTION_HEADER_KEY);
}
