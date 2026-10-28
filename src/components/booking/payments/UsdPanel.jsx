import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DollarSign, ShieldCheck } from 'lucide-react';
import { USD_LIMITS } from '../../../config/site';
import { formatUsd } from '../../../lib/format';
import { usdCentsFor } from '../../../lib/pricing';
import Button from '../../ui/Button';
import UsdCheckoutModal from './UsdCheckoutModal';

// The "US dollars" choice at checkout. It explains the price in dollars and opens a small window
// where the client confirms their details and pays.
export default function UsdPanel({ mode, offer, quote, instant, reference, details, onPaid, onTaken }) {
  const [open, setOpen] = useState(false);
  const usualCents = usdCentsFor(quote.total);

  return (
    <div className="space-y-5">
      <div className="flex gap-3 rounded-2xl bg-surface px-4 py-3.5 text-fig-800">
        <ShieldCheck size={22} className="mt-0.5 shrink-0 text-moss-600" aria-hidden="true" />
        <p>
          You choose the amount you pay in US dollars, from {formatUsd(USD_LIMITS.min)} to {formatUsd(USD_LIMITS.max)},
          and pay with your card on Paystack&rsquo;s secure page. Your card details are never entered on this website,
          and your bank may add its own fees for paying in a different currency.
        </p>
      </div>

      <Button size="lg" className="w-full sm:w-auto" onClick={() => setOpen(true)}>
        <DollarSign size={19} aria-hidden="true" /> Pay in US dollars
      </Button>
      <p className="text-sm text-fig-600">
        Your time is kept for you while you pay. Please finish within about 30 minutes.
      </p>

      <AnimatePresence>
        {open && (
          <UsdCheckoutModal
            key="usd-checkout"
            mode={mode}
            offer={offer}
            quote={quote}
            instant={instant}
            reference={reference}
            details={details}
            usualCents={usualCents}
            onClose={() => setOpen(false)}
            onPaid={onPaid}
            onTaken={onTaken}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
