// https://github.com/testing-library/jest-dom?tab=readme-ov-file#with-vitest
import '@testing-library/jest-dom/vitest';
import process from 'node:process';
import { afterEach, vi } from 'vitest';

// jsdom does not implement Blob.prototype.arrayBuffer
// (used by file-based parsers before passing the buffer to mocked unzipSync)
if (!Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function () {
    return Promise.resolve(new ArrayBuffer(0));
  };
}

// Pin a stable timezone so date-formatter tests behave the same on every
// developer machine and in CI.
process.env.TZ = 'UTC';

afterEach(() => {
  vi.clearAllMocks();
});
