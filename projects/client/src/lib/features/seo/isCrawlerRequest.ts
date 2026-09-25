import { isBotAgent } from '$lib/utils/devices/isBotAgent.ts';

type CrawlerRequestParams = {
  userAgent: Nil | string;
  isLegitimateBot: boolean;
};

export function isCrawlerRequest(
  { userAgent, isLegitimateBot }: CrawlerRequestParams,
): boolean {
  return isLegitimateBot || isBotAgent(userAgent);
}
