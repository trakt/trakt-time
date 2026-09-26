import type { UserProfile } from '../models/UserProfile.ts';

export function toUniqueProfiles(
  profiles: ReadonlyArray<UserProfile>,
): UserProfile[] {
  return Array.from(
    new Map(profiles.map((profile) => [profile.slug, profile])).values(),
  );
}
