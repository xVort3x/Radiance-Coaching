import { useState } from 'react';
import { LoaderCircle, Lock, ShieldCheck } from 'lucide-react';
import { formatKes } from '../../../lib/format';
import { startPaystackCheckout } from '../../../services/paystack';
import Button from '../../ui/Button';
import Notice from '../../ui/Notice';
import { PhonePulse } from './MpesaPanel';

// Used for both the M-Pesa and Card choices when Paystack is switched on. The client is sent to
// Paystack's secure page, pays there, and is brought back to the site, where the payment is
// checked automatically before the booking is confirmed.
export default function PaystackPanel({ method, offer, quote, instant, reference, details, onTaken }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const mpesa = method === 'mpesa';

  const pay = async () => {
    setError('');
    setBusy(true);
    try {
      const result = await startPaystackCheckout({ reference, offer, quote, instant, details });
      if (result.taken) {
        setBusy(false);
        onTaken();
        return;
      }
      // Leaves the site on purpose; Paystack brings the client back after payment.
      window.location.assign(result.url);
    } catch (err) {
      setBusy(false);
      setError(err?.message || 'The payment page could not be opened. Please try again.');
    }
  };

  return (
    <div className="space-y-5">
      {mpesa && <PhonePulse />}
      <div className="flex gap-3 rounded-2xl bg-surface px-4 py-3.5 text-fig-800">
        <ShieldCheck size={22} className="mt-0.5 shrink-0 text-moss-600" aria-hidden="true" />
        <p>
          {mpesa ? (
            <>
              You will pay <strong>{formatKes(quote.total)}</strong> on Paystack&rsquo;s secure page. Choose M-Pesa
              there, enter your phone number, and approve the prompt on your phone with your M-Pesa PIN.
            </>
          ) : (
            <>
              You will pay <strong>{formatKes(quote.total)}</strong> with Visa or Mastercard on Paystack&rsquo;s
              secure page. Your card details are never entered on this website.
            </>
          )}{' '}
          You will be brought back here, and your booking is confirmed as soon as the payment arrives.
        </p>
      </div>

      {error && <Notice tone="error">{error}</Notice>}

      <Button size="lg" className="w-full sm:w-auto" onClick={pay} disabled={busy}>
        {busy ? (
          <>
            <LoaderCircle size={20} className="animate-spin" aria-hidden="true" /> Opening the secure page
          </>
        ) : (
          <>
            <Lock size={19} aria-hidden="true" /> Pay {formatKes(quote.total)} securely
          </>
        )}
      </Button>
      <p className="text-sm text-fig-600">
        Your time is kept for you while you pay. Please finish within about 30 minutes.
      </p>
    </div>
  );
}
