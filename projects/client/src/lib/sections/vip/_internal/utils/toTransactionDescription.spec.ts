import type { VipTransaction } from '$lib/requests/models/VipTransaction.ts';
import { describe, expect, it } from 'vitest';
import { toTransactionDescription } from './toTransactionDescription.ts';

const payment: VipTransaction = {
  id: 1,
  gateway: 'stripe',
  type: 'payment',
  vipType: 'yearly',
  amount: '59.99',
  currency: 'usd',
  couponCode: null,
  createdAt: new Date('2026-01-01T10:00:00Z'),
};

describe('toTransactionDescription', () => {
  it('should describe a payment with its amount, method and term', () => {
    const result = toTransactionDescription(payment);

    expect(result).to.equal(
      'Charged <b>$59.99</b> via <b>Credit Card</b> for <b>1 year</b>',
    );
  });

  it('should drop the term when the payment has no plan type', () => {
    const result = toTransactionDescription({ ...payment, vipType: null });

    expect(result).to.equal('Charged <b>$59.99</b> via <b>Credit Card</b>');
  });

  it('should describe a cancellation by its method', () => {
    const result = toTransactionDescription({
      ...payment,
      type: 'cancel',
      gateway: 'paypal',
    });

    expect(result).to.equal('Cancelled a <b>PayPal</b> subscription');
  });
});
