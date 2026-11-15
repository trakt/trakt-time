if (typeof Array.prototype.findLastIndex !== 'function') {
  Object.defineProperty(Array.prototype, 'findLastIndex', {
    value<T>(
      this: ArrayLike<T>,
      predicate: (value: T, index: number, array: ArrayLike<T>) => unknown,
      thisArg?: unknown,
    ): number {
      const items = Array.from(this);
      const index = items
        .map((_, i) => i)
        .reverse()
        .find((i) => predicate.call(thisArg, items[i] as T, i, this));

      return index ?? -1;
    },
    writable: true,
    configurable: true,
  });
}
