import type { CastMember } from '$lib/requests/models/MediaCrew.ts';

export type CastGroupType = 'main' | 'supporting';

export type CastGroup = {
  type: CastGroupType;
  members: ReadonlyArray<CastMember>;
};
