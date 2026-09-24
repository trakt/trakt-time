import * as m from '$lib/paraglide/messages.js';
import type { EpisodeStatus } from './getEpisodeStatus.ts';

const STATUS_LABELS: Record<EpisodeStatus, () => string> = {
  premiere: m.tag_text_premiere,
  finale: m.tag_text_finale,
  new: m.tag_text_new,
};

export function episodeStatusLabel(
  status: EpisodeStatus | undefined,
): string | null {
  return status ? STATUS_LABELS[status]() : null;
}
