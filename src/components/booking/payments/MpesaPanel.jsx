import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LoaderCircle, Smartphone } from 'lucide-react';
import { ENV } from '../../../config/env';
import { formatKes } from '../../../lib/format';
import { isMpesaCode, normalizeKenyanPhone } from '../../../lib/validation';
import { requestMpesaPush, sleep, waitForMpesa } from '../../../services/payments';
import Button from '../../ui/Button';
import CopyButton from '../../ui/CopyButton';
import Notice from '../../ui/Notice';

const demoReceipt = () => `DEMO${Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)}`;

function PhonePulse() {
  return (
    <div className="relative mx-auto flex h-28 w-28 items-center justify-center" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full border-2 border-moss-500"
          initial={{ scale: 0.55, opacity: 0.7 }}
          animate={{ scale: 1.25, opacity: 0 }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}
        />
      ))}
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-moss-700 text-white">
        <Smartphone size={28} />
      </span>
    </div>
  );
}

export default function MpesaPanel({ mode, amountKes, reference, defaultPhone, onSuccess }) {
  const [phone, setPhone] = useState(defaultPhone || '');
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | sending | waiting
  const [error, setError] = useState('');
  const controller = useRef(null);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => () => controller.current?.abort(), []);

  const startPush = async (event) => {
    event.preventDefault();
    const normalized = normalizeKenyanPhone(phone);
    if (!normalized) {
      setError('Enter the Safaricom number you will pay from, for example 0712 345 678.');
      return;
    }
    setError('');
    setPhase('sending');
    controller.current?.abort();
    const ctl = new AbortController();
    controller.current = ctl;
    try {
      if (mode === 'demo') {
        await sleep(1400, ctl.signal);
        setPhase('waiting');
        await sleep(5200, ctl.signal);
        onSuccessRef.current({ method: 'mpesa', status: 'paid', receipt: demoReceipt(), phone: normalized, demo: true });
        return;
      }
      const id = await requestMpesaPush({ phone: normalized, amountKes, reference });
      setPhase('waiting');
      const { receipt } = await waitForMpesa(id, { signal: ctl.signal });
      onSuccessRef.current({ method: 'mpesa', status: 'paid', receipt, phone: normalized });
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setPhase('idle');
      setError(
        `${err?.message || 'The payment did not go through.'} You have not been charged unless you entered your PIN. You can try again.`,
      );
    }
  };

  const cancel = () => {
    controller.current?.abort();
    setPhase('idle');
  };

  const confirmManual = (event) => {
    event.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!isMpesaCode(clean)) {
      setError('The M-Pesa code is 10 letters and numbers, for example SGH7K2L9QX.');
      return;
    }
    setError('');
    onSuccessRef.current({ method: 'mpesa', status: 'awaiting-verification', receipt: clean });
  };

  if (mode === 'manual') {
    const hasTill = Boolean(ENV.mpesaTill);
    return (
      <form onSubmit={confirmManual} noValidate className="space-y-5">
        <ol className="space-y-4 text-fig-800">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-moss-100 text-sm text-moss-800">1</span>
            <span>
              On your phone open <strong>M-Pesa</strong>, then{' '}
              <strong>{hasTill ? 'Lipa na M-Pesa, Buy Goods (Till Number)' : 'Lipa na M-Pesa, Paybill'}</strong>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-moss-100 text-sm text-moss-800">2</span>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-2.5">
                <span>
                  <span className="block text-sm text-fig-600">{hasTill ? 'Till number' : 'Business number'}</span>
                  <span className="font-medium tracking-wide">{hasTill ? ENV.mpesaTill : ENV.mpesaPaybill}</span>
                </span>
                <CopyButton text={hasTill ? ENV.mpesaTill : ENV.mpesaPaybill} />
              </div>
              {!hasTill && (
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-2.5">
                  <span>
                    <span className="block text-sm text-fig-600">Account number</span>
                    <span className="font-medium tracking-wide">{reference}</span>
                  </span>
                  <CopyButton text={reference} />
                </div>
              )}
              <div className="rounded-2xl bg-white px-4 py-2.5">
                <span className="block text-sm text-fig-600">Amount</span>
                <span className="font-medium">{formatKes(amountKes)}</span>
              </div>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-moss-100 text-sm text-moss-800">3</span>
            <span>Enter your PIN. M-Pesa will text you a confirmation code. Type that code below.</span>
          </li>
        </ol>

        <div>
          <label htmlFor="mpesa-code" className="mb-1.5 block text-sm font-medium text-fig-800">
            M-Pesa confirmation code
          </label>
          <input
            id="mpesa-code"
            className="field uppercase tracking-widest"
            value={code}
            maxLength={10}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'mpesa-error' : undefined}
          />
          {error && (
            <p id="mpesa-error" className="mt-1.5 text-sm text-[#b4452f]">
              {error}
            </p>
          )}
        </div>
        <Notice>Anne checks each code against her M-Pesa records, then confirms your session by email.</Notice>
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          I have paid {formatKes(amountKes)}
        </Button>
      </form>
    );
  }

  const demo = mode === 'demo';

  if (phase === 'waiting') {
    return (
      <div className="py-4 text-center" role="status" aria-live="polite">
        <PhonePulse />
        <p className="mt-5 font-display text-2xl text-fig-900">Check your phone</p>
        <p className="mx-auto mt-2 max-w-sm text-fig-700">
          {demo
            ? 'In a live payment, M-Pesa would now ask for your PIN. This preview confirms by itself in a few seconds.'
            : `M-Pesa is asking you to pay ${formatKes(amountKes)}. Enter your PIN to finish.`}
        </p>
        <Button variant="quiet" className="mt-4" onClick={cancel}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={startPush} noValidate className="space-y-5">
      {demo && (
        <Notice tone="demo">
          Preview only. No money moves and nothing is sent to Anne. Add your live payment settings to
          take real payments.
        </Notice>
      )}
      <div>
        <label htmlFor="mpesa-phone" className="mb-1.5 block text-sm font-medium text-fig-800">
          M-Pesa phone number
        </label>
        <input
          id="mpesa-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0712 345 678"
          className="field"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'mpesa-error' : 'mpesa-hint'}
        />
        {error ? (
          <p id="mpesa-error" role="alert" className="mt-1.5 text-sm text-[#b4452f]">
            {error}
          </p>
        ) : (
          <p id="mpesa-hint" className="mt-1.5 text-sm text-fig-600">
            We will send a payment request of {formatKes(amountKes)} to this number.
          </p>
        )}
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={phase === 'sending'}>
        {phase === 'sending' ? (
          <>
            <LoaderCircle size={20} className="animate-spin" aria-hidden="true" /> Sending request
          </>
        ) : (
          <>Send payment request</>
        )}
      </Button>
    </form>
  );
}
