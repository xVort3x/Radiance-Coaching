import { ENV } from '../config/env';

export function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

async function readJson(response) {
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json();
}

// ── M-Pesa (automatic prompt via your backend) ───────────────────────────────
// POST {API}/mpesa/stk-push   { phone: "2547XXXXXXXX", amount: 5000, reference }
//   -> { checkoutRequestId }
// GET  {API}/mpesa/status/:id -> { status: "pending" | "paid" | "failed", receipt?, message? }
export async function requestMpesaPush({ phone, amountKes, reference }) {
  const data = await readJson(
    await fetch(`${ENV.apiBase}/mpesa/stk-push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, amount: amountKes, reference }),
    }),
  );
  if (!data.checkoutRequestId) throw new Error('The payment request did not start.');
  return data.checkoutRequestId;
}

export async function waitForMpesa(id, { signal, intervalMs = 3000, timeoutMs = 90_000 } = {}) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    await sleep(intervalMs, signal);
    const data = await readJson(
      await fetch(`${ENV.apiBase}/mpesa/status/${encodeURIComponent(id)}`, { signal }),
    );
    if (data.status === 'paid') return { receipt: data.receipt || id };
    if (data.status === 'failed') throw new Error(data.message || 'The M-Pesa payment was not completed.');
  }
  throw new Error('We did not receive a confirmation in time.');
}

// ── Card (always on the provider's own secure page) ──────────────────────────
// With VITE_CARD_CHECKOUT_VIA_API=true:
//   POST {API}/card/checkout { amount, reference, email, name } -> { url }
// Otherwise VITE_CARD_CHECKOUT_URL (single session) or VITE_CARD_CHECKOUT_URL_PACKAGE
// (5-session package) is used as a static payment link.
export async function createCardCheckout({ amountKes, reference, email, name, isPackage = false }) {
  if (ENV.cardViaApi && ENV.apiBase) {
    const data = await readJson(
      await fetch(`${ENV.apiBase}/card/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountKes, reference, email, name }),
      }),
    );
    if (!data.url) throw new Error('No checkout link was returned.');
    return data.url;
  }
  const url = new URL(isPackage ? ENV.cardCheckoutUrlPackage : ENV.cardCheckoutUrl);
  url.searchParams.set('ref', reference);
  return url.toString();
}

// ── PayPal (client-side Smart Buttons) ───────────────────────────────────────
let paypalLoading = null;

export function loadPayPal(clientId) {
  if (typeof window !== 'undefined' && window.paypal?.Buttons) return Promise.resolve(window.paypal);
  if (paypalLoading) return paypalLoading;
  paypalLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      clientId,
    )}&currency=USD&intent=capture&components=buttons`;
    script.async = true;
    script.onload = () => resolve(window.paypal);
    script.onerror = () => {
      paypalLoading = null;
      reject(new Error('PayPal could not be loaded.'));
    };
    document.head.appendChild(script);
  });
  return paypalLoading;
}
