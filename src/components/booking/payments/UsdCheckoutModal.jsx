import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { LoaderCircle, Lock, ShieldCheck, X } from 'lucide-react';
import { PACKAGE, SITE, TIME, USD_LIMITS } from '../../../config/site';
import { formatDateEat, formatTimeEat } from '../../../lib/dates';
import { formatKes, formatUsd } from '../../../lib/format';
import { useDialog } from '../../../lib/useDialog';
import { isEmail } from '../../../lib/validation';
import { startPaystackCheckout } from '../../../services/paystack';
import { sleep } from '../../../services/payments';
import { AnimatedCheck } from '../Confirmation';
import Button from '../../ui/Button';
import Notice from '../../ui/Notice';

const EASE = [0.22, 1, 0.36, 1];

// Reads what the client typed: "25", "25.5", "US$1,250.00". Returns dollars, or null if it is not an amount.
export function parseUsd(text) {
  const cleaned = String(text).replace(/US\$|\$|,|\s/gi, '');
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(Number(cleaned) * 100) / 100;
}
const demoReceipt = () => `DEMO${Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)}`;

function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fig-800">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-sm text-fig-600">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-err-icon">
          {error}
        </p>
      )}
    </div>
  );
}

// A window on top of the booking window. The client checks the dollar price, confirms their name
// and email (the receipt goes there), then pays on Paystack. In preview mode the payment is
// simulated: it shows "confirmed", closes the window and finishes the booking.
export default function UsdCheckoutModal({ mode, offer, quote, instant, reference, details, usualCents, onClose, onPaid, onTaken }) {
  const reduce = useReducedMotion();
  const panelRef = useRef(null);
  const alive = useRef(true);
  const [values, setValues] = useState({ amount: (usualCents / 100).toFixed(2), name: details.name || '', email: details.email || '' });
  const [errors, setErrors] = useState({});
  const [phase, setPhase] = useState('form'); // form | working | done
  const [problem, setProblem] = useState('');
  const busy = phase !== 'form';
  const demo = mode === 'demo';

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useDialog(panelRef, () => {
    if (phase === 'form') onClose();
  });

  const set = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };
  const invalid = (key) => ({
    'aria-invalid': Boolean(errors[key]),
    'aria-describedby': errors[key] ? `usdco-${key}-error` : undefined,
  });

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    const dollars = parseUsd(values.amount);
    if (dollars === null) next.amount = 'Please enter an amount in US dollars, for example 50 or 50.00.';
    else if (dollars < USD_LIMITS.min || dollars > USD_LIMITS.max) {
      next.amount = `Please enter an amount between ${formatUsd(USD_LIMITS.min)} and ${formatUsd(USD_LIMITS.max)}.`;
    }
    if (values.name.trim().length < 2) next.name = 'Please enter your name.';
    if (!isEmail(values.email)) next.email = 'Please enter a valid email address.';
    setErrors(next);
    setProblem('');
    if (Object.keys(next).length > 0) {
      panelRef.current?.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    setPhase('working');

    if (demo) {
      await sleep(1600);
      if (!alive.current) return;
      setPhase('done');
      await sleep(1500);
      if (!alive.current) return;
      onClose();
      await sleep(350);
      onPaid({ method: 'usd', status: 'paid', receipt: demoReceipt(), demo: true });
      return;
    }

    try {
      const result = await startPaystackCheckout({
        reference,
        offer,
        quote,
        instant,
        usdAmount: dollars,
        details: { ...details, name: values.name.trim(), email: values.email.trim() },
      });
      if (!alive.current) return;
      if (result.taken) {
        onClose();
        onTaken();
        return;
      }
      // Leaves the site on purpose; Paystack brings the client back after payment.
      window.location.assign(result.url);
    } catch (err) {
      if (!alive.current) return;
      setPhase('form');
      setProblem(err?.message || 'The payment page could not be opened. Please try again.');
    }
  };

  const amountNow = parseUsd(values.amount);
  const amountOk = amountNow !== null && amountNow >= USD_LIMITS.min && amountNow <= USD_LIMITS.max;
  const when = `${formatDateEat(instant)}, ${formatTimeEat(instant)} ${TIME.label}`;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6" onClick={(e) => e.stopPropagation()}>
      <motion.div
        className="absolute inset-0 bg-fig-950/60 backdrop-blur-[3px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={() => !busy && onClose()}
        aria-hidden="true"
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="usdco-title"
        tabIndex={-1}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 48, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.98 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="relative flex max-h-[100svh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] bg-mist-100 shadow-[0_40px_80px_-30px_rgba(29,23,38,0.7)] outline-none sm:max-h-[92svh] sm:rounded-[2rem]"
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6 sm:px-8 sm:pt-8">
          <div>
            <h2 id="usdco-title" className="text-3xl leading-tight text-fig-900">
              Pay in US dollars
            </h2>
            <p className="mt-2 text-fig-700">Check the amount and your details, then pay on Paystack&rsquo;s secure page.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="-mr-2 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-fig-800 hover:bg-moss-100 disabled:opacity-40"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <form noValidate onSubmit={submit} className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-4 sm:px-8 sm:pb-8">
          {phase === 'done' ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center" role="status" aria-live="polite">
              <AnimatedCheck />
              <p className="font-display text-2xl text-fig-900">Payment confirmed</p>
              <p className="text-fig-700">Taking you to your booking.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {demo && <Notice tone="demo">Preview only. No money moves.</Notice>}

              <div className="rounded-2xl bg-mist-200 px-5 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <p className="text-fig-800">
                    {offer.name}
                    {quote.isPackage && `, ${PACKAGE.sessions}-session package`}
                  </p>
                  <p className="font-display text-3xl text-fig-900">{formatKes(quote.total)}</p>
                </div>
                <p className="mt-1 text-sm text-fig-700">
                  {quote.isPackage ? 'First session: ' : ''}
                  {when}.
                </p>
              </div>

              <Field
                id="usdco-amount"
                label="Amount you will pay (US dollars)"
                error={errors.amount}
                hint={`You can choose any amount from ${formatUsd(USD_LIMITS.min)} to ${formatUsd(USD_LIMITS.max)}.`}
              >
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-fig-700" aria-hidden="true">
                    US$
                  </span>
                  <input
                    id="usdco-amount"
                    data-autofocus
                    className="field pl-14"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0.00"
                    value={values.amount}
                    onChange={set('amount')}
                    disabled={busy}
                    {...invalid('amount')}
                  />
                </div>
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="usdco-name" label="Your name" error={errors.name}>
                  <input
                    id="usdco-name"
                    className="field"
                    autoComplete="name"
                    value={values.name}
                    onChange={set('name')}
                    disabled={busy}
                    {...invalid('name')}
                  />
                </Field>
                <Field id="usdco-email" label="Email address" error={errors.email} hint="Your receipt goes here.">
                  <input
                    id="usdco-email"
                    type="email"
                    className="field"
                    autoComplete="email"
                    value={values.email}
                    onChange={set('email')}
                    disabled={busy}
                    {...invalid('email')}
                  />
                </Field>
              </div>

              {problem && <Notice tone="error">{problem}</Notice>}

              <div className="flex gap-3 rounded-2xl bg-surface px-4 py-3.5 text-fig-800">
                <ShieldCheck size={22} className="mt-0.5 shrink-0 text-moss-600" aria-hidden="true" />
                <p className="text-[0.95rem]">
                  You pay with your card on Paystack&rsquo;s own page. Your card details are never entered on this
                  website. Your bank may add its own fees for paying in a different currency. {SITE.coachFirstName}{' '}
                  confirms your booking as soon as the payment arrives.
                </p>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? (
                  <>
                    <LoaderCircle size={20} className="animate-spin" aria-hidden="true" />
                    {demo ? 'Confirming your payment' : 'Opening the secure page'}
                  </>
                ) : (
                  <>
                    <Lock size={19} aria-hidden="true" />
                    {amountOk ? `Confirm and pay ${formatUsd(amountNow)}` : 'Confirm and pay'}
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </motion.div>
    </div>,
    document.body,
  );
}
