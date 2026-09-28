import { describe, expect, it } from 'vitest';
import { toPaidUntil } from './toPaidUntil.ts';

describe('toPaidUntil', () => {
  it('should return the expiry when it is past the renewal day', () => {
    const expiresAt = new Date('2027-06-01T10:00:00Z');

    const result = toPaidUntil({
      renewsAt: new Date('2027-01-01T10:00:00Z'),
      expiresAt,
    });

    expect(result).to.equal(expiresAt);
  });

  it('should return null when the expiry falls on the renewal day', () => {
    const result = toPaidUntil({
      renewsAt: new Date('2027-01-01T08:00:00Z'),
      expiresAt: new Date('2027-01-01T09:00:00Z'),
    });

    expect(result).to.equal(null);
  });

  it('should return null when the subscription does not renew', () => {
    const result = toPaidUntil({
      renewsAt: null,
      expiresAt: new Date('2027-01-01T10:00:00Z'),
    });

    expect(result).to.equal(null);
  });
});
