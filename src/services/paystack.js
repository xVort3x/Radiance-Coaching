import { localDiffers, formatLocal } from '../lib/dates';
import { postToApi } from './availability';

// Paystack takes the money on its own secure page (card or M-Pesa prompt). The booking
// helper (backend/Code.gs) creates the checkout and later confirms with Paystack that the
// right amount was paid. Nothing here can mark a booking as paid by itself.

// RC- references are bookings, RU- references are USD payments.
const PAY_REF = /^R[CU]-[A-Za-z0-9]+-\d+$/;

export const isPayRef = (value) => PAY_REF.test(String(value || ''));
export const isUsdRef = (value) => /^RU-/.test(String(value || ''));

// The page Paystack sends the client back to after paying: this site, without any query or hash.
const returnUrl = () => `${window.location.origin}${window.location.pathname}`;

export async function startPaystackCheckout({ reference, offer, quote, instant, details }) {
  const data = await postToApi({
    action: 'payinit',
    ref: reference,
    offerId: offer.id,
    isPackage: quote.isPackage,
    start: instant.getTime(),
    name: details.name,
    email: details.email,
    phone: details.phone,
    notes: details.notes,
    localTime: localDiffers(instant) ? formatLocal(instant) : '',
    returnUrl: returnUrl(),
  });
  if (data.ok && data.url) return { url: data.url };
  if (data.code === 'taken') return { taken: true };
  throw new Error(data.message || 'The payment page could not be opened. Please try again.');
}

// Asks the helper to check the payment with Paystack. Resolves to { state, info, emailed }.
export async function verifyPaystack(payRef) {
  const data = await postToApi({ action: 'payverify', payRef });
  if (!data.ok) throw new Error(data.message || 'The payment could not be checked.');
  return data;
}

// "Pay in USD": the client chooses the amount. The helper checks it against its own limits.
export async function startUsdCheckout({ name, email, amount, note }) {
  const data = await postToApi({ action: 'usdinit', name, email, amount, note, returnUrl: returnUrl() });
  if (data.ok && data.url) return { url: data.url };
  throw new Error(data.message || 'The payment page could not be opened. Please try again.');
}

export async function verifyUsd(payRef) {
  const data = await postToApi({ action: 'usdverify', payRef });
  if (!data.ok) throw new Error(data.message || 'The payment could not be checked.');
  return data;
}
