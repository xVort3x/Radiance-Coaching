import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getPaymentModes } from '../../../config/payments';
import { PACKAGE, SITE } from '../../../config/site';
import { formatKes } from '../../../lib/format';
import Button from '../../ui/Button';
import Notice from '../../ui/Notice';
import CardPanel from './CardPanel';
import MethodPicker from './MethodPicker';
import MpesaPanel from './MpesaPanel';
import PaystackPanel from './PaystackPanel';
import UsdPanel from './UsdPanel';

export default function PaymentStep({ offer, quote, instant, reference, details, onPaid, onPayLater, onTaken }) {
  const modes = useMemo(() => getPaymentModes({ isPackage: quote.isPackage }), [quote.isPackage]);
  const available = ['mpesa', 'card', 'usd'].filter((id) => modes[id] !== 'unavailable');
  const [method, setMethod] = useState(available[0] ?? null);

  if (available.length === 0) {
    return (
      <div className="space-y-5">
        <Notice tone="info">
          Online payment is not switched on for this site yet. You can still request this time. {SITE.coachFirstName}{' '}
          will confirm it and share payment details by email.
        </Notice>
        <Button size="lg" onClick={onPayLater}>
          Request this time and pay by email
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-mist-200 px-5 py-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p className="text-fig-800">
            {offer.name}
            {quote.isPackage && `, ${PACKAGE.sessions}-session package`}
          </p>
          <p className="font-display text-3xl text-fig-900">
            {formatKes(quote.total)}
          </p>
        </div>
        {quote.isPackage && (
          <p className="mt-1 text-sm text-fig-700">
            {quote.count} sessions at {formatKes(quote.each)} each, {formatKes(PACKAGE.discountPerSessionKes)} off every
            session. You save {formatKes(quote.saving)}.
          </p>
        )}
      </div>

      <MethodPicker value={method} onChange={setMethod} modes={modes} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={method}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {(method === 'mpesa' || method === 'card') && modes[method] === 'paystack' && (
            <PaystackPanel
              method={method}
              offer={offer}
              quote={quote}
              instant={instant}
              reference={reference}
              details={details}
              onTaken={onTaken}
            />
          )}
          {method === 'usd' && (
            <UsdPanel
              mode={modes.usd}
              offer={offer}
              quote={quote}
              instant={instant}
              reference={reference}
              details={details}
              onPaid={onPaid}
              onTaken={onTaken}
            />
          )}
          {method === 'mpesa' && modes.mpesa !== 'paystack' && (
            <MpesaPanel
              mode={modes.mpesa}
              amountKes={quote.total}
              reference={reference}
              defaultPhone={details.phone}
              onSuccess={onPaid}
            />
          )}
          {method === 'card' && modes.card !== 'paystack' && (
            <CardPanel
              mode={modes.card}
              amountKes={quote.total}
              isPackage={quote.isPackage}
              reference={reference}
              details={details}
              onSuccess={onPaid}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
