export type PeopleTab = 'following' | 'followers' | 'requests';

type ToPeopleTabParams = {
  value: string | null;
  isOwner: boolean;
};

export function toPeopleTab({ value, isOwner }: ToPeopleTabParams): PeopleTab {
  if (value === 'followers') return 'followers';
  if (value === 'requests' && isOwner) return 'requests';
  return 'following';
}
