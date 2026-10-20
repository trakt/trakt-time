import type { CastMember } from '$lib/requests/models/MediaCrew.ts';
import { dedupe } from '$lib/utils/array/dedupe.ts';
import type { CastGroup, CastGroupType } from './CastGroup.ts';

type CastGroupsProps = {
  cast: ReadonlyArray<CastMember>;
  guestStars: ReadonlyArray<CastMember>;
};

export function toCastGroups({
  cast,
  guestStars,
}: CastGroupsProps): CastGroup[] {
  const isSplit = cast.length > 0 && guestStars.length > 0;
  if (isSplit) {
    return [
      { type: 'main', members: cast },
      { type: 'supporting', members: guestStars },
    ];
  }

  const members = dedupe((member) => member.key, [...cast], [...guestStars]);
  return members.length > 0 ? [{ type: 'main', members }] : [];
}

type ActiveCastGroupTypeProps = {
  groups: ReadonlyArray<CastGroup>;
  selected: CastGroupType;
};

export function toActiveCastGroupType({
  groups,
  selected,
}: ActiveCastGroupTypeProps): CastGroupType {
  if (groups.some((group) => group.type === selected)) return selected;

  return groups.at(0)?.type ?? 'main';
}
