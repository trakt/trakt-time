import { time } from '$lib/utils/timing/time.ts';

type ShareTarget = {
  url: string;
  title: string;
};

export function useShareLink() {
  let isCopied = $state(false);

  async function copy(url: string) {
    if (!navigator.clipboard) return;

    const isWritten = await navigator.clipboard.writeText(url)
      .then(() => true, () => false);
    if (!isWritten) return;

    isCopied = true;
    setTimeout(() => (isCopied = false), time.seconds(2));
  }

  async function share({ url, title }: ShareTarget) {
    if (!navigator.share) {
      return copy(url);
    }

    await navigator.share({ url, title }).catch(() => undefined);
  }

  return {
    share,
    get isCopied() {
      return isCopied;
    },
  };
}
