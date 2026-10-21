import { ENV } from '../config/env';

// Talks to the booking helper (backend/Code.gs) so the calendar can hide times
// that are already taken. Every call fails quietly: if the helper cannot be
// reached, the site still works, it just cannot see other people's bookings.

export const sharedCalendar = () => Boolean(ENV.bookingApi);

export async function fetchBusy(signal) {
  if (!ENV.bookingApi) return [];
  const response = await fetch(`${ENV.bookingApi}?action=busy&t=${Date.now()}`, { signal, cache: 'no-store' });
  const data = await response.json();
  if (!data?.ok || !Array.isArray(data.busy)) throw new Error('Unexpected reply');
  return data.busy
    .map((b) => ({ start: Number(b.start), end: Number(b.end) }))
    .filter((b) => Number.isFinite(b.start) && Number.isFinite(b.end));
}

// Apps Script web apps accept a plain-text POST without a browser pre-check, so
// the JSON is sent as text/plain.
export async function postToApi(payload) {
  const response = await fetch(ENV.bookingApi, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!data) throw new Error('Empty reply');
  return data;
}

// Reserves a time for a few minutes while the visitor pays.
// Returns 'held', 'taken', or 'unknown' when the helper could not be reached.
export async function holdSlot({ ref, instant, minutes, offerName, email }) {
  if (!ENV.bookingApi) return 'held';
  try {
    const data = await postToApi({ action: 'hold', ref, start: instant.getTime(), minutes, offerName, email });
    if (data.ok) return 'held';
    return data.code === 'taken' ? 'taken' : 'unknown';
  } catch {
    return 'unknown';
  }
}
