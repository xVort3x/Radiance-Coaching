// Single place where build-time settings are read. See .env.example.
const env = import.meta.env;

const flag = (value) => String(value ?? '').trim().toLowerCase() === 'true';
const text = (value) => String(value ?? '').trim();

// WhatsApp number to international digits only, e.g. 0712 345 678 -> 254712345678.
function whatsappDigits(value) {
  const digits = text(value).replace(/\D/g, '');
  if (!digits) return '';
  if (/^0[17]\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^[17]\d{8}$/.test(digits)) return `254${digits}`;
  return digits;
}

export const ENV = {
  formEndpoint: text(env.VITE_FORM_ENDPOINT),
  // Booking helper (Google Apps Script web app). See backend/Code.gs and the README.
  bookingApi: text(env.VITE_BOOKING_API_URL),
  whatsapp: whatsappDigits(env.VITE_WHATSAPP_NUMBER),
  apiBase: text(env.VITE_API_BASE_URL).replace(/\/+$/, ''),
  mpesaTill: text(env.VITE_MPESA_TILL),
  mpesaPaybill: text(env.VITE_MPESA_PAYBILL),
  mpesaAccount: text(env.VITE_MPESA_ACCOUNT),
  cardCheckoutUrl: text(env.VITE_CARD_CHECKOUT_URL),
  cardCheckoutUrlPackage: text(env.VITE_CARD_CHECKOUT_URL_PACKAGE),
  cardViaApi: flag(env.VITE_CARD_CHECKOUT_VIA_API),
  // Card and M-Pesa through Paystack (needs the booking helper). See the README.
  paystack: flag(env.VITE_PAYSTACK),
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
