export type ProfileHeader = 'posters' | 'cover';

export function toProfileHeader(value: string | Nil): ProfileHeader {
  return value === 'cover' ? 'cover' : 'posters';
}
