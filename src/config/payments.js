import { ENV, isDemoMode } from './env';

/**
 * How each payment method behaves on this deployment.
 *
 *  live         Fully automatic (needs the keys or backend described in the README)
 *  manual       M-Pesa Till/Paybill instructions, verified by Anne
 *  hosted       Card entry happens on the payment provider's own page
 *  demo         Simulated, for previews only. Never moves money.
 *  unavailable  Not set up yet, so it cannot be chosen
 */
export function getPaymentModes() {
  const demo = isDemoMode();
  return {
    mpesa: ENV.apiBase
      ? 'live'
      : ENV.mpesaTill || ENV.mpesaPaybill
        ? 'manual'
        : demo
          ? 'demo'
          : 'unavailable',
    paypal: ENV.paypalClientId ? 'live' : demo ? 'demo' : 'unavailable',
    card:
      ENV.cardCheckoutUrl || (ENV.cardViaApi && ENV.apiBase)
        ? 'hosted'
        : demo
          ? 'demo'
          : 'unavailable',
  };
}

export const PAYMENT_METHODS = [
  { id: 'mpesa', name: 'M-Pesa', hint: 'Mobile money' },
  { id: 'paypal', name: 'PayPal', hint: 'PayPal account' },
  { id: 'card', name: 'Card', hint: 'Visa or Mastercard' },
];
