import { safeLocalStorage } from '$lib/utils/storage/safeStorage.ts';
import { BehaviorSubject } from 'rxjs';
import { type ProfileHeader, toProfileHeader } from './toProfileHeader.ts';

const PROFILE_HEADER_STORAGE_KEY = 'trakt-profile-header';

const profileHeader = new BehaviorSubject<ProfileHeader>(
  toProfileHeader(safeLocalStorage.getItem(PROFILE_HEADER_STORAGE_KEY)),
);

function setProfileHeader(value: ProfileHeader) {
  safeLocalStorage.setItem(PROFILE_HEADER_STORAGE_KEY, value);
  profileHeader.next(value);
}

export function useProfileHeader() {
  return { profileHeader, setProfileHeader };
}
