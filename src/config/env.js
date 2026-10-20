// Single place where build-time settings are read. See .env.example.
const env = import.meta.env;

const flag = (value) => String(value ?? '').trim().toLowerCase() === 'true';
const text = (value) => String(value ?? '').trim();

const rate = Number(env.VITE_KES_PER_USD);

export const ENV = {
  formEndpoint: text(env.VITE_FORM_ENDPOINT),
  apiBase: text(env.VITE_API_BASE_URL).replace(/\/+$/, ''),
  mpesaTill: text(env.VITE_MPESA_TILL),
  mpesaPaybill: text(env.VITE_MPESA_PAYBILL),
  paypalClientId: text(env.VITE_PAYPAL_CLIENT_ID),
  cardCheckoutUrl: text(env.VITE_CARD_CHECKOUT_URL),
  cardViaApi: flag(env.VITE_CARD_CHECKOUT_VIA_API),
  kesPerUsd: Number.isFinite(rate) && rate > 0 ? rate : 129,
  demoFlag: flag(env.VITE_DEMO_PAYMENTS),
  isDev: Boolean(env.DEV),
};

/**
 * Demo mode simulates the payment step so the flow can be previewed.
 * It never moves money and never sends a booking to Anne.
 * On: `npm run dev`, VITE_DEMO_PAYMENTS=true, or ?demo=payments in the address.
 */
export function isDemoMode() {
  if (ENV.isDev || ENV.demoFlag) return true;
  try {
    return new URLSearchParams(window.location.search).get('demo') === 'payments';
  } catch {
    return false;
  }
}
