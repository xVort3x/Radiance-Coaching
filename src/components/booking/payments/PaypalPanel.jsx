import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, Wallet } from 'lucide-react';
import { ENV } from '../../../config/env';
import { formatKes, formatUsd, kesToUsd } from '../../../lib/format';
import { loadPayPal, sleep } from '../../../services/payments';
import Button from '../../ui/Button';
import Notice from '../../ui/Notice';

const demoReceipt = () => `DEMO${Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)}`;

export default function PaypalPanel({ mode, amountKes, reference, description, onSuccess }) {
  const usd = kesToUsd(amountKes, ENV.kesPerUsd);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  return (
    <div className="space-y-5">
      {mode === 'demo' && (
        <Notice tone="demo">
          Preview only. No money moves and nothing is sent to Anne.
        </Notice>
      )}
      <div className="rounded-2xl bg-white px-4 py-3.5 text-fig-800">
        <p>
          PayPal does not support Kenyan Shillings, so this is charged as{' '}
          <strong>{formatUsd(usd)}</strong> (about {formatKes(amountKes)} at {ENV.kesPerUsd} KSh to the dollar).
          PayPal shows the final amount before you confirm.
        </p>
      </div>
      {mode === 'demo' ? (
        <DemoButton onSuccessRef={onSuccessRef} />
      ) : (
        <LiveButtons
          usd={usd}
          reference={reference}
          description={description}
          onSuccessRef={onSuccessRef}
        />
      )}
    </div>
  );
}

function DemoButton({ onSuccessRef }) {
  const [busy, setBusy] = useState(false);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const pay = async () => {
    setBusy(true);
    try {
      await sleep(1800);
    } finally {
      if (alive.current) {
        onSuccessRef.current({ method: 'paypal', status: 'paid', receipt: demoReceipt(), demo: true });
      }
    }
  };

  return (
    <Button
      size="lg"
      variant="sun"
      className="w-full"
      onClick={pay}
      disabled={busy}
      aria-live="polite"
    >
      {busy ? (
        <>
          <LoaderCircle size={20} className="animate-spin" aria-hidden="true" /> Approving the payment
        </>
      ) : (
        <>
          <Wallet size={20} aria-hidden="true" /> Pay with PayPal
        </>
      )}
    </Button>
  );
}

function LiveButtons({ usd, reference, description, onSuccessRef }) {
  const container = useRef(null);
  const [state, setState] = useState('loading'); // loading | ready | error
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let buttons = null;
    setState('loading');

    loadPayPal(ENV.paypalClientId)
      .then((paypal) => {
        if (cancelled || !container.current) return null;
        buttons = paypal.Buttons({
          style: { layout: 'vertical', shape: 'pill', label: 'pay', height: 48 },
          createOrder: (_data, actions) =>
            actions.order.create({
              purchase_units: [
                {
                  reference_id: reference,
                  description,
                  amount: { currency_code: 'USD', value: usd.toFixed(2) },
                },
              ],
            }),
          onApprove: async (_data, actions) => {
            const order = await actions.order.capture();
            onSuccessRef.current({ method: 'paypal', status: 'paid', receipt: order.id });
          },
          onError: () => {
            setMessage('PayPal could not complete the payment. You have not been charged. Please try again.');
          },
          onCancel: () => setMessage('Payment cancelled. You can try again when you are ready.'),
        });
        return buttons.render(container.current);
      })
      .then(() => {
        if (!cancelled) setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });

    return () => {
      cancelled = true;
      try {
        buttons?.close();
      } catch {
        /* already removed */
      }
    };
  }, [usd, reference, description, onSuccessRef, attempt]);

  return (
    <div>
      {state === 'loading' && (
        <p className="flex items-center gap-2 text-fig-700" role="status">
          <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> Loading PayPal
        </p>
      )}
      {state === 'error' && (
        <Notice tone="error">
          PayPal could not load. Check your connection and{' '}
          <button type="button" className="underline" onClick={() => setAttempt((n) => n + 1)}>
            try again
          </button>
          , or choose another way to pay.
        </Notice>
      )}
      <div ref={container} className={state === 'ready' ? 'min-h-12' : ''} />
      {message && (
        <p role="status" className="mt-3 text-sm text-fig-700">
          {message}
        </p>
      )}
    </div>
  );
}
