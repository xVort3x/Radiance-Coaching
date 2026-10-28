import { ENV, isDemoMode } from './env';

/**
 * How each payment method behaves on this deployment.
 *
 *  live         Fully automatic (needs the keys or backend described in the README)
 *  manual       M-Pesa Till/Paybill instructions, verified by Anne
 *  hosted       Card entry happens on the payment provider's own page
 *  paystack     Paid on Paystack's secure page (card or M-Pesa prompt), checked automatically
 *  demo         Simulated, for previews only. Never moves money.
 *  unavailable  Not set up yet, so it cannot be chosen
 */
export function getPaymentModes({ isPackage = false } = {}) {
  const demo = isDemoMode();
  // A payment link has one fixed amount, so the 5-session package needs its own link.
  const cardUrl = isPackage ? ENV.cardCheckoutUrlPackage : ENV.cardCheckoutUrl;
  const paystack = ENV.paystack && ENV.bookingApi;
  return {
    mpesa: paystack
      ? 'paystack'
      : ENV.apiBase
        ? 'live'
      : ENV.mpesaTill || ENV.mpesaPaybill
        ? 'manual'
        : demo
          ? 'demo'
          : 'unavailable',
    card: paystack
      ? 'paystack'
      : cardUrl || (ENV.cardViaApi && ENV.apiBase)
        ? 'hosted'
        : demo
          ? 'demo'
          : 'unavailable',
    // Card payment in US dollars. It only exists through Paystack, and only once it is switched on
    // (VITE_PAY_USD=true), which should wait until Paystack has approved a USD account.
    usd: paystack && ENV.payUsd ? 'paystack' : demo ? 'demo' : 'unavailable',
  };
}

export const PAYMENT_METHODS = [
  { id: 'mpesa', name: 'M-Pesa', hint: 'Mobile money' },
  { id: 'card', name: 'Card', hint: 'Debit or credit card' },
  { id: 'usd', name: 'US dollars', hint: 'Pay by card in USD' },
];
