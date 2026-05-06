// https://github.com/testing-library/jest-dom?tab=readme-ov-file#with-vitest
import '@testing-library/jest-dom/vitest';
import process from 'node:process';

// Pin a stable timezone so date-formatter tests behave the same on every
// developer machine and in CI.
process.env.TZ = 'UTC';
