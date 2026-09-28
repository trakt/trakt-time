import { languageTag } from '$lib/features/i18n/index.ts';
import { m } from '$lib/features/i18n/messages.ts';
import type { VipTransaction } from '$lib/requests/models/VipTransaction.ts';
import { toHumanCurrency } from '$lib/utils/formatting/currency/toHumanCurrency.ts';
import { toPaymentMethodLabel } from './toPaymentMethodLabel.ts';
import { toVipDurationLabel } from './toVipDurationLabel.ts';

function toAmountLabel(transaction: VipTransaction): string | null {
  if (transaction.amount == null || !transaction.currency) return null;

  const price = Number(transaction.amount);
  if (Number.isNaN(price)) return null;

  return toHumanCurrency({
    price,
    currency: transaction.currency,
    locale: languageTag(),
  });
}

export function toTransactionDescription(transaction: VipTransaction): string {
  const method = toPaymentMethodLabel(transaction.gateway);
  const amount = toAmountLabel(transaction);
  const term = toVipDurationLabel(transaction.vipType);

  switch (transaction.type) {
    case 'payment':
      return amount && term
        ? m.text_vip_transaction_charged({ amount, method, term })
        : m.text_vip_transaction_charged_short({
          amount: amount ?? '',
          method,
        });
    case 'refund':
      return m.text_vip_transaction_refunded({ amount: amount ?? '', method });
    case 'create':
      return m.text_vip_transaction_created({ method });
    case 'cancel':
      return m.text_vip_transaction_cancelled({ method });
    case 'dispute':
      return m.text_vip_transaction_disputed({ method });
    case 'plan_change':
      return m.text_vip_transaction_plan_changed({ method });
    default:
      return m.text_vip_transaction_complimentary();
  }
}
