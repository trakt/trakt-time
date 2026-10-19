function combineSignals(first: AbortSignal, second: AbortSignal) {
  if (typeof AbortSignal.any !== 'function') return second;

  return AbortSignal.any([first, second]);
}

export function withSignal(signal: AbortSignal) {
  return ((input, init) =>
    globalThis.fetch(input, {
      ...init,
      signal: init?.signal ? combineSignals(init.signal, signal) : signal,
    })) as typeof fetch;
}
