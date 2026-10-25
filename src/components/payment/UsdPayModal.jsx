import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LoaderCircle, Lock, ShieldCheck, X } from 'lucide-react';
import { USD_PAY, SITE } from '../../config/site';
import { isDemoMode } from '../../config/env';
import { formatUsd } from '../../lib/format';
import { isEmail } from '../../lib/validation';
import { useDialog } from '../../lib/useDialog';
import { startUsdCheckout } from '../../services/paystack';
import { useUsdPay } from '../../usd/UsdPayContext';
import { AnimatedCheck } from '../booking/Confirmation';
import Button from '../ui/Button';
import Notice from '../ui/Notice';

const EASE = [0.22, 1, 0.36, 1];

// Reads what the client typed: "25", "25.5", "US$1,250.00". Returns dollars, or null if it is not an amount.
export function parseUsd(text) {
  const cleaned = String(text).replace(/US\$|\$|,|\s/gi, '');
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(Number(cleaned) * 100) / 100;
}

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

function Dialog({ onClose }) {
  const reduce = useReducedMotion();
  const panelRef = useRef(null);
  const [values, setValues] = useState({ name: '', email: '', amount: '', note: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');
  const [previewDone, setPreviewDone] = useState(false);
  useDialog(panelRef, onClose);

  const set = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };
  const invalid = (key) => ({
    'aria-invalid': Boolean(errors[key]),
    'aria-describedby': errors[key] ? `usd-${key}-error` : undefined,
  });

  const amount = parseUsd(values.amount);
  const amountOk = amount !== null && amount >= USD_PAY.min && amount <= USD_PAY.max;

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (values.name.trim().length < 2) next.name = 'Please enter your name.';
    if (!isEmail(values.email)) next.email = 'Please enter a valid email address.';
    if (amount === null) next.amount = 'Please enter an amount in US dollars, for example 50 or 50.00.';
    else if (amount < USD_PAY.min || amount > USD_PAY.max) {
      next.amount = `Please enter an amount between ${formatUsd(USD_PAY.min)} and ${formatUsd(USD_PAY.max)}.`;
    }
    setErrors(next);
    setProblem('');
    if (Object.keys(next).length > 0) {
      panelRef.current?.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    if (isDemoMode()) {
      setPreviewDone(true);
      return;
    }
    setBusy(true);
    try {
      const result = await startUsdCheckout({
        name: values.name.trim(),
        email: values.email.trim(),
        amount,
        note: values.note.trim(),
      });
      // Leaves the site on purpose; Paystack brings the client back after payment.
      window.location.assign(result.url);
    } catch (err) {
      setBusy(false);
      setProblem(err?.message || 'The payment page could not be opened. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <motion.div
        className="absolute inset-0 bg-fig-950/60 backdrop-blur-[3px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="usd-title"
        tabIndex={-1}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 48, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.98 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="relative flex max-h-[100svh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] bg-mist-100 shadow-[0_40px_80px_-30px_rgba(29,23,38,0.7)] outline-none sm:max-h-[92svh] sm:rounded-[2rem]"
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6 sm:px-8 sm:pt-8">
          <div>
            <h2 id="usd-title" className="text-3xl leading-tight text-fig-900">
              Pay in US dollars
            </h2>
            <p className="mt-2 text-fig-700">
              Enter the amount you would like to pay {SITE.coachFirstName}. You finish on Paystack&rsquo;s secure page.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-fig-800 hover:bg-moss-100"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        {previewDone ? (
          <div className="space-y-5 px-6 pb-8 pt-4 sm:px-8">
            <div className="flex items-center gap-4">
              <AnimatedCheck />
              <p className="font-display text-2xl text-fig-900">Preview complete</p>
            </div>
            <Notice tone="demo">
              Preview only. Nothing was charged or sent. On the live site this button opens Paystack to pay{' '}
              {formatUsd(amount ?? 0)}.
            </Notice>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <form noValidate onSubmit={submit} className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-4 sm:px-8 sm:pb-8">
            <div className="space-y-5">
              {isDemoMode() && <Notice tone="demo">Preview only. No money moves.</Notice>}

              <Field id="usd-amount" label="Amount (US dollars)" error={errors.amount} hint={`Between ${formatUsd(USD_PAY.min)} and ${formatUsd(USD_PAY.max)}.`}>
                <div className="relative">
                  <span
                    className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-fig-700"
                    aria-hidden="true"
                  >
                    US$
                  </span>
                  <input
                    id="usd-amount"
                    data-autofocus
                    className="field pl-14"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0.00"
                    value={values.amount}
                    onChange={set('amount')}
                    {...invalid('amount')}
                  />
                </div>
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="usd-name" label="Your name" error={errors.name}>
                  <input
                    id="usd-name"
                    className="field"
                    autoComplete="name"
                    value={values.name}
                    onChange={set('name')}
                    {...invalid('name')}
                  />
                </Field>
                <Field id="usd-email" label="Email address" error={errors.email} hint="Your receipt goes here.">
                  <input
                    id="usd-email"
                    type="email"
                    className="field"
                    autoComplete="email"
                    value={values.email}
                    onChange={set('email')}
                    {...invalid('email')}
                  />
                </Field>
              </div>

              <Field id="usd-note" label="What is this payment for? (optional)">
                <input
                  id="usd-note"
                  className="field"
                  maxLength={200}
                  placeholder="For example: 3 coaching sessions"
                  value={values.note}
                  onChange={set('note')}
                />
              </Field>

              {problem && <Notice tone="error">{problem}</Notice>}

              <div className="flex gap-3 rounded-2xl bg-surface px-4 py-3.5 text-fig-800">
                <ShieldCheck size={22} className="mt-0.5 shrink-0 text-moss-600" aria-hidden="true" />
                <p className="text-[0.95rem]">
                  You pay with Visa or Mastercard on Paystack&rsquo;s own page. Your card details are never entered on this
                  website. Your bank may add its own fees for paying in a different currency.
                </p>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? (
                  <>
                    <LoaderCircle size={20} className="animate-spin" aria-hidden="true" /> Opening the secure page
                  </>
                ) : (
                  <>
                    <Lock size={19} aria-hidden="true" />
                    {amountOk ? `Pay ${formatUsd(amount)} securely` : 'Continue to secure payment'}
                  </>
                )}
              </Button>

              <p className="text-sm text-fig-600">
                By continuing you agree to our{' '}
                <a className="underline" href="#/terms" target="_blank" rel="noopener noreferrer">
                  terms of service
                </a>{' '}
                and{' '}
                <a className="underline" href="#/privacy" target="_blank" rel="noopener noreferrer">
                  privacy policy
                </a>
                . They open in a new tab.
              </p>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default function UsdPayModal() {
  const { open, closeUsdPay } = useUsdPay();
  return createPortal(
    <AnimatePresence>{open && <Dialog key="usd-dialog" onClose={closeUsdPay} />}</AnimatePresence>,
    document.body,
  );
}
