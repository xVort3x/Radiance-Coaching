import { motion } from 'framer-motion';
import { LoaderCircle, Mail, RotateCw } from 'lucide-react';
import { SITE, TIME } from '../../config/site';
import { formatKes } from '../../lib/format';
import { formatDateEat, formatTimeEat } from '../../lib/dates';
import { buildBookingText, bookingSubject, describePayment, mailtoHref } from '../../services/booking';
import Button from '../ui/Button';
import CopyButton from '../ui/CopyButton';
import Notice from '../ui/Notice';

export function AnimatedCheck() {
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16" aria-hidden="true">
      <motion.circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        style={{ stroke: 'var(--color-logo-ground)' }}
        strokeWidth="3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M20 33l8 8 17-18"
        fill="none"
        stroke="#E9B44C"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

const headline = (booking, delivery) => {
  if (booking.demo) return 'Preview complete';
  if (delivery === 'taken') return 'That time was just taken';
  if (delivery === 'rescheduling') return 'Payment received';
  if (delivery === 'failed') return 'One more step';
  return booking.offer.priceKes > 0 ? 'Booking received' : 'Request sent';
};

export default function Confirmation({ booking, delivery, emailed, onPickAnother, onRetry, onClose }) {
  const { ref, offer, quote, instant, details, payment } = booking;

  const text = buildBookingText(booking);
  const mailHref = mailtoHref(bookingSubject(booking), text);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {delivery !== 'taken' && <AnimatedCheck />}
        <div>
          <h3 className="font-display text-3xl text-fig-900">{headline(booking, delivery)}</h3>
          <p className="text-fig-700">
            {booking.demo
              ? 'This was a preview, so nothing was paid or sent.'
              : delivery === 'taken'
                ? 'Someone booked it a moment before you. Nothing has been charged.'
                : delivery === 'rescheduling'
                  ? `Thank you, ${details.name.trim().split(/\s+/)[0]}. Someone else took your chosen time while you were paying.`
                  : emailed
                    ? `Thank you, ${details.name.trim().split(/\s+/)[0]}. A confirmation is on its way to ${details.email}.`
                    : `Thank you, ${details.name.trim().split(/\s+/)[0]}. ${SITE.coachFirstName} will confirm your time by email.`}
          </p>
        </div>
      </div>

      {booking.demo && (
        <Notice tone="demo">
          This site is in payment preview mode. Add your live payment settings (see the README) to take real
          bookings and payments.
        </Notice>
      )}

      {delivery === 'sending' && (
        <p className="flex items-center gap-2 text-fig-700" role="status">
          <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> Sending your booking to{' '}
          {SITE.coachFirstName}
        </p>
      )}

      {delivery === 'taken' && (
        <Notice tone="error">
          Please choose another time. Your details are saved in this window.
          <div className="mt-3">
            <Button size="sm" variant="secondary" onClick={onPickAnother}>
              Choose another time
            </Button>
          </div>
        </Notice>
      )}

      {delivery === 'rescheduling' && (
        <Notice tone="error">
          Your payment has been recorded, and {SITE.coachFirstName} has been told. She will contact you at{' '}
          {details.email} to choose another time that suits you. Reference {ref}.
        </Notice>
      )}

      {delivery === 'failed' && (
        <Notice tone="error">
          Your booking could not be sent to {SITE.coachFirstName}
          {payment.status === 'paid' ? ' (your payment did go through)' : ''}. Please try again, or email{' '}
          <a href={mailHref} className="underline">
            {SITE.email}
          </a>{' '}
          with reference {ref}.
          <div className="mt-3">
            <Button size="sm" variant="secondary" onClick={onRetry}>
              <RotateCw size={16} aria-hidden="true" /> Try sending again
            </Button>
          </div>
        </Notice>
      )}

      {delivery !== 'taken' && delivery !== 'rescheduling' && quote.isPackage && (
        <Notice>
          {SITE.coachFirstName} will email you to arrange your other {quote.count - 1} sessions. Your first session is
          the time shown below.
        </Notice>
      )}

      {payment.status === 'awaiting-verification' && (
        <Notice>Anne will check your M-Pesa code before confirming.</Notice>
      )}
      {payment.status === 'awaiting-card' && (
        <Notice>Anne will confirm your card payment before confirming the session.</Notice>
      )}
      {payment.status === 'pay-later' && (
        <Notice>Anne will email you payment details with your confirmation.</Notice>
      )}

      {delivery !== 'taken' && (
      <dl className="divide-y divide-moss-200 rounded-2xl border border-moss-200 bg-surface">
        {[
          ['Reference', ref],
          ['Service', `${offer.name}, ${offer.minutes} minutes${quote.isPackage ? ' each' : ''}`],
          quote.isPackage ? ['Package', `${quote.count} sessions at ${formatKes(quote.each)} each`] : null,
          [quote.isPackage ? 'First session' : 'When', `${formatDateEat(instant)}, ${formatTimeEat(instant)} ${TIME.label}`],
          [quote.isPackage ? 'Total' : 'Cost', formatKes(quote.total)],
          offer.priceKes > 0 ? ['Payment', describePayment(payment)] : null,
          payment.receipt ? ['Payment code', payment.receipt] : null,
        ]
          .filter(Boolean)
          .map(([label, value]) => (
            <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[8rem_1fr]">
              <dt className="text-sm text-fig-600">{label}</dt>
              <dd className="text-fig-900">{value}</dd>
            </div>
          ))}
      </dl>
      )}

      <div className="flex flex-wrap gap-3">
        {delivery === 'failed' && (
          <>
            <Button as="a" variant="secondary" href={mailHref}>
              <Mail size={18} aria-hidden="true" /> Email Anne
            </Button>
            <CopyButton text={text} label="Copy details" />
          </>
        )}
        <Button onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}
