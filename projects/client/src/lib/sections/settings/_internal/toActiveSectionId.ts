type SectionPosition = {
  id: string;
  top: number;
};

type ToActiveSectionIdParams = {
  sections: ReadonlyArray<SectionPosition>;
  activationLine: number;
  isAtBottom: boolean;
};

export function toActiveSectionId(
  { sections, activationLine, isAtBottom }: ToActiveSectionIdParams,
): string | Nil {
  if (isAtBottom) return sections.at(-1)?.id;

  const passed = sections.filter((section) => section.top <= activationLine);
  return (passed.at(-1) ?? sections.at(0))?.id;
}
