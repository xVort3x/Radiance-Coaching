import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink, Lock, LoaderCircle, ShieldCheck } from 'lucide-react';
import { ENV } from '../../../config/env';
import { formatKes } from '../../../lib/format';
import {
  detectBrand,
  expiryValid,
  formatCardNumber,
  formatExpiry,
  luhnValid,
} from '../../../lib/validation';
import { createCardCheckout, sleep } from '../../../services/payments';
import Button from '../../ui/Button';
import Notice from '../../ui/Notice';

const demoReceipt = () => `DEMO${Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)}`;

export default function CardPanel({ mode, amountKes, isPackage = false, reference, details, onSuccess }) {
  if (mode === 'demo') return <DemoCard amountKes={amountKes} onSuccess={onSuccess} />;
  return (
    <HostedCheckout
      amountKes={amountKes}
      isPackage={isPackage}
      reference={reference}
      details={details}
      onSuccess={onSuccess}
    />
  );
}

// ── Real deployments: card details are typed on the provider's own page ──────
function HostedCheckout({ amountKes, isPackage, reference, details, onSuccess }) {
  const [phase, setPhase] = useState('idle'); // idle | opening | opened
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const open = async () => {
    setError('');
    setPhase('opening');
    try {
      const target = await createCardCheckout({
        amountKes,
        reference,
        email: details.email,
        name: details.name,
        isPackage,
      });
      setUrl(target);
      window.open(target, '_blank', 'noopener,noreferrer');
      setPhase('opened');
    } catch (err) {
      setPhase('idle');
      setError(err?.message || 'The checkout could not be opened.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-3 rounded-2xl bg-surface px-4 py-3.5 text-fig-800">
        <ShieldCheck size={22} className="mt-0.5 shrink-0 text-moss-600" aria-hidden="true" />
        <p>
          You will pay {formatKes(amountKes)} with your card on a secure page run by our payment
          provider. Your card details are never entered on this website.
        </p>
      </div>

      {error && <Notice tone="error">{error}</Notice>}

      {phase !== 'opened' ? (
        <Button size="lg" className="w-full sm:w-auto" onClick={open} disabled={phase === 'opening'}>
          {phase === 'opening' ? (
            <>
              <LoaderCircle size={20} className="animate-spin" aria-hidden="true" /> Opening checkout
            </>
          ) : (
            <>
              <Lock size={19} aria-hidden="true" /> Continue to secure checkout
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-4" role="status" aria-live="polite">
          <Notice>
            The checkout opened in a new tab.{' '}
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline">
              Open it again <ExternalLink size={14} aria-hidden="true" />
            </a>
            . When you have finished paying, come back here and press the button below.
          </Notice>
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => onSuccess({ method: 'card', status: 'awaiting-card', receipt: reference })}
          >
            I have completed my payment
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Preview mode: an interactive card that never leaves the page ─────────────
function DemoCard({ amountKes, onSuccess }) {
  const reduce = useReducedMotion();
  const [form, setForm] = useState({ number: '', name: '', expiry: '', cvc: '' });
  const [errors, setErrors] = useState({});
  const [flipped, setFlipped] = useState(false);
  const [busy, setBusy] = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const brand = detectBrand(form.number);
  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const pay = async (event) => {
    event.preventDefault();
    const next = {};
    if (!luhnValid(form.number)) next.number = 'Check the card number.';
    if (form.name.trim().length < 2) next.name = 'Enter the name on the card.';
    if (!expiryValid(form.expiry)) next.expiry = 'Enter a future date, MM/YY.';
    if (!/^\d{3,4}$/.test(form.cvc)) next.cvc = 'Enter the 3 or 4 digit code.';
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      document.getElementById(`card-${first}`)?.focus();
      return;
    }
    setBusy(true);
    await sleep(1900);
    if (alive.current) onSuccess({ method: 'card', status: 'paid', receipt: demoReceipt(), demo: true });
  };

  const display = form.number ? formatCardNumber(form.number) : '•••• •••• •••• ••••';

  const inputProps = (key) => ({
    id: `card-${key}`,
    className: 'field',
    'aria-invalid': Boolean(errors[key]),
    'aria-describedby': errors[key] ? `card-${key}-error` : undefined,
  });
  const err = (key) =>
    errors[key] && (
      <p id={`card-${key}-error`} className="mt-1.5 text-sm text-err-icon">
        {errors[key]}
      </p>
    );

  return (
    <form onSubmit={pay} noValidate className="space-y-5">
      <Notice tone="demo">
        Preview only. Nothing is charged, sent or stored. Please use a test number such as
        4242 4242 4242 4242, not a real card.
      </Notice>

      <div className="[perspective:1000px]" aria-hidden="true">
        <motion.div
          className="relative mx-auto h-48 w-full max-w-sm [transform-style:preserve-3d]"
          animate={{ rotateY: flipped && !reduce ? 180 : 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="on-dark absolute inset-0 flex flex-col justify-between rounded-3xl bg-gradient-to-br from-moss-700 via-moss-800 to-fig-900 p-5 text-white shadow-[0_20px_40px_-20px_rgba(42,34,51,0.6)] [backface-visibility:hidden]">
            <div className="flex items-center justify-between">
              <span className="h-8 w-11 rounded-md bg-gradient-to-br from-sun-200 to-sun-500" />
              <span className="font-display text-xl">{brand ?? 'Card'}</span>
            </div>
            <p className="font-mono text-[1.15rem] tracking-[0.12em]">{display}</p>
            <div className="flex items-end justify-between text-sm">
              <span className="max-w-[60%] truncate uppercase tracking-wide">
                {form.name || 'Name on card'}
              </span>
              <span>{form.expiry || 'MM/YY'}</span>
            </div>
          </div>
          <div className="on-dark absolute inset-0 rounded-3xl bg-gradient-to-br from-fig-800 to-fig-950 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="mt-6 h-10 bg-black/70" />
            <div className="mx-5 mt-5 flex items-center justify-end rounded bg-white/90 px-3 py-2 font-mono text-ink">
              {form.cvc || '•••'}
            </div>
          </div>
        </motion.div>
      </div>

      <div>
        <label htmlFor="card-number" className="mb-1.5 block text-sm font-medium text-fig-800">
          Card number {brand && <span className="font-normal text-fig-600">({brand})</span>}
        </label>
        <input
          {...inputProps('number')}
          inputMode="numeric"
          autoComplete="off"
          placeholder="4242 4242 4242 4242"
          value={formatCardNumber(form.number)}
          onChange={(e) => set('number', e.target.value.replace(/\D/g, '').slice(0, 19))}
        />
        {err('number')}
      </div>
      <div>
        <label htmlFor="card-name" className="mb-1.5 block text-sm font-medium text-fig-800">
          Name on card
        </label>
        <input
          {...inputProps('name')}
          autoComplete="off"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
        />
        {err('name')}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="card-expiry" className="mb-1.5 block text-sm font-medium text-fig-800">
            Expiry
          </label>
          <input
            {...inputProps('expiry')}
            inputMode="numeric"
            autoComplete="off"
            placeholder="MM/YY"
            value={form.expiry}
            onChange={(e) => set('expiry', formatExpiry(e.target.value))}
          />
          {err('expiry')}
        </div>
        <div>
          <label htmlFor="card-cvc" className="mb-1.5 block text-sm font-medium text-fig-800">
            Security code
          </label>
          <input
            {...inputProps('cvc')}
            inputMode="numeric"
            autoComplete="off"
            placeholder="123"
            maxLength={4}
            value={form.cvc}
            onChange={(e) => set('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
            onFocus={() => setFlipped(true)}
            onBlur={() => setFlipped(false)}
          />
          {err('cvc')}
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={busy}>
        {busy ? (
          <>
            <LoaderCircle size={20} className="animate-spin" aria-hidden="true" /> Processing
          </>
        ) : (
          <>
            <Lock size={19} aria-hidden="true" /> Pay {formatKes(amountKes)}
          </>
        )}
      </Button>
    </form>
  );
}
