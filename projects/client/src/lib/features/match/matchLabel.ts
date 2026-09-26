import * as m from '$lib/paraglide/messages.js';

export function matchLabel(score: number): string {
  if (score >= 90) return m.match_label_soulmates();
  if (score >= 75) return m.match_label_co_stars();
  if (score >= 60) return m.match_label_crossover();
  if (score >= 45) return m.match_label_spin_off();
  if (score >= 25) return m.match_label_cameo();
  return m.match_label_different_universe();
}
