import { PACKAGE, SITE, TIME, SESSION_FORMAT } from '../config/site';
import { ENV } from '../config/env';
import { formatKes } from '../lib/format';
import { formatDateEat, formatTimeEat, formatLocal, localDiffers } from '../lib/dates';
import { postToApi } from './availability';

export function makeReference() {
  const time = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3).padEnd(3, 'X');
  return `RC-${time}${rand}`;
}

const PAYMENT_LABELS = {
  free: 'No payment needed',
  paid: 'Paid',
  'awaiting-verification': 'Paid by M-Pesa, waiting for Anne to verify the code',
  'awaiting-card': 'Card checkout opened, waiting for the payment to complete',
  'pay-later': 'Payment details to be arranged by email',
};

const METHOD_LABELS = { mpesa: 'M-Pesa', card: 'Card (Visa or Mastercard)', none: '' };

export function describePayment(payment) {
  const status = PAYMENT_LABELS[payment.status] ?? payment.status;
  const method = METHOD_LABELS[payment.method] ?? '';
  return [method, status].filter(Boolean).join(': ');
}

export function buildBookingText(booking) {
  const { ref, offer, quote, instant, details, payment } = booking;
  const lines = [
    `Booking reference: ${ref}`,
    `Service: ${offer.name}, ${offer.minutes} minutes${quote.isPackage ? ' each' : ''}`,
  ];
  if (quote.isPackage) {
    lines.push(
      `Package: ${quote.count} sessions at ${formatKes(quote.each)} each (${formatKes(PACKAGE.discountPerSessionKes)} off every session), total ${formatKes(quote.total)}`,
      `ACTION: arrange the other ${quote.count - 1} sessions with the client.`,
    );
  } else {
    lines.push(`Cost: ${formatKes(quote.total)}`);
  }
  lines.push(`${quote.isPackage ? 'First session' : 'When'}: ${formatDateEat(instant)}, ${formatTimeEat(instant)} ${TIME.label}`);
  if (localDiffers(instant)) lines.push(`Client's local time: ${formatLocal(instant)}`);
  lines.push(
    '',
    `Name: ${details.name}`,
    `Email: ${details.email}`,
    `Phone: ${details.phone || 'Not given'}`,
  );
  if (details.notes?.trim()) lines.push('', 'Notes from the client:', details.notes.trim());
  lines.push('', `Payment: ${describePayment(payment)}`);
  if (payment.receipt) lines.push(`Payment reference: ${payment.receipt}`);
  if (payment.phone) lines.push(`M-Pesa phone: ${payment.phone}`);
  return lines.join('\n');
}

export function mailtoHref(subject, body) {
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Sends a message to Anne from the page itself, with no email app involved.
// By default it posts to FormSubmit, which forwards the message to Anne's inbox.
// Set VITE_FORM_ENDPOINT to use a different service (see README).
const DEFAULT_ENDPOINT = `https://formsubmit.co/ajax/${SITE.email}`;

async function deliver({ subject, replyTo, fields, text }) {
  const response = await fetch(ENV.formEndpoint || DEFAULT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      _subject: subject,
      _captcha: 'false',
      _template: 'table',
      email: replyTo,
      ...fields,
      message: text,
    }),
  });
  let data = null;
  try {
    data = await response.json();
  } catch {
    /* some services reply with an empty body */
  }
  const accepted = data && 'success' in data ? String(data.success) === 'true' : response.ok;
  if (!response.ok || !accepted) throw new Error(data?.message || `Delivery failed (${response.status})`);
}

export function bookingSubject(booking) {
  const pack = booking.quote.isPackage ? ` (${PACKAGE.sessions}-session package)` : '';
  return `${booking.offer.name}${pack} request from ${booking.details.name} (${booking.ref})`;
}

// Result: { emailed, taken, rescheduling }.
//  emailed      the client has been sent a confirmation email
//  taken        the time was taken by someone else (free bookings only)
//  rescheduling the client had already paid, so Anne will arrange another time
export async function submitBooking(booking) {
  if (ENV.bookingApi) {
    const { ref, offer, quote, instant, details, payment } = booking;
    const data = await postToApi({
      action: 'book',
      ref,
      start: instant.getTime(),
      minutes: offer.minutes,
      offerId: offer.id,
      offerName: offer.name,
      discovery: offer.priceKes === 0,
      isPackage: quote.isPackage,
      sessions: quote.count,
      each: quote.each,
      total: quote.total,
      name: details.name,
      email: details.email,
      phone: details.phone,
      notes: details.notes,
      payment: { status: payment.status, method: payment.method, receipt: payment.receipt },
      paymentText: describePayment(payment),
      localTime: localDiffers(instant) ? formatLocal(instant) : '',
    });
    if (data.ok) return { emailed: Boolean(data.emailed), taken: false, rescheduling: Boolean(data.rescheduling) };
    if (data.code === 'taken') return { emailed: false, taken: true, rescheduling: false };
    throw new Error(data.message || 'The booking could not be saved.');
  }

  await deliver({
    subject: bookingSubject(booking),
    replyTo: booking.details.email,
    fields: {
      name: booking.details.name,
      phone: booking.details.phone,
      reference: booking.ref,
      session: booking.offer.name + (booking.quote.isPackage ? ` (${PACKAGE.sessions}-session package)` : ''),
      when: `${formatDateEat(booking.instant)}, ${formatTimeEat(booking.instant)} ${TIME.label}`,
      payment: describePayment(booking.payment),
    },
    text: buildBookingText(booking),
  });
  return { emailed: false, taken: false, rescheduling: false };
}

export async function submitContact({ name, email, message, website = '' }) {
  if (ENV.bookingApi) {
    const data = await postToApi({ action: 'contact', name, email, message, website });
    if (!data.ok) throw new Error(data.message || 'The message could not be sent.');
    return;
  }
  const text = `From: ${name} <${email}>\n\n${message}`;
  await deliver({
    subject: `Message from ${name} via the Radiance Coaching website`,
    replyTo: email,
    fields: { name },
    text,
  });
}

export const calendarLocation = SESSION_FORMAT;
