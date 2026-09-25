import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types.ts';

export const load: PageLoad = () => {
  redirect(308, '/movies/watchlist');
};
