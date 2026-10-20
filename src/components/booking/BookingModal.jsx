import { useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { OFFERS } from '../../config/site';
import { isDemoMode } from '../../config/env';
import { useBooking } from '../../booking/BookingContext';
import { isEmail, normalizeKenyanPhone } from '../../lib/validation';
import { isBookable, slotInstant, slotsFor } from '../../lib/dates';
import { useDialog } from '../../lib/useDialog';
import { quoteFor } from '../../lib/pricing';
import { makeReference, submitBooking } from '../../services/booking';
import Button from '../ui/Button';
import Calendar from './Calendar';
import Confirmation from './Confirmation';
import DetailsForm from './DetailsForm';
import SessionSummary from './SessionSummary';
import StepIndicator from './StepIndicator';
import TimeSlots from './TimeSlots';
import PaymentStep from './payments/PaymentStep';

const EASE = [0.22, 1, 0.36, 1];
const EMPTY_DETAILS = { name: '', email: '', phone: '', notes: '' };

function Dialog({ initialOffer, initialBundle, onClose }) {
  const reduce = useReducedMotion();
  const panelRef = useRef(null);
  const bodyRef = useRef(null);
  useDialog(panelRef, onClose);

  const now = useMemo(() => new Date(), []);
  const reference = useMemo(() => makeReference(), []);

  const [offerId, setOfferId] = useState(initialOffer);
  const [bundle, setBundle] = useState(initialBundle && OFFERS[initialOffer].priceKes > 0);
  const [stepId, setStepId] = useState('when');
  const [direction, setDirection] = useState(1);
  const [dateKey, setDateKey] = useState(null);
  const [time, setTime] = useState(null);
  const [details, setDetails] = useState(EMPTY_DETAILS);
  const [errors, setErrors] = useState({});
  const [booking, setBooking] = useState(null);
  const [delivery, setDelivery] = useState('sending');

  const offer = OFFERS[offerId];
  const paid = offer.priceKes > 0;
  const quote = quoteFor(offer, bundle);
  const steps = useMemo(
    () => [
      { id: 'when', label: 'Choose a time' },
      { id: 'details', label: 'Your details' },
      ...(paid ? [{ id: 'pay', label: 'Payment' }] : []),
    ],
    [paid],
  );
  const stepIndex = steps.findIndex((s) => s.id === stepId);
  const instant = dateKey && time ? slotInstant(dateKey, time) : null;

  const go = useCallback((id, dir) => {
    setDirection(dir);
    setStepId(id);
    bodyRef.current?.scrollTo({ top: 0 });
  }, []);

  const pickDate = (key) => {
    setDateKey(key);
    // Keep the time only if the new day offers it.
    setTime((current) => (current && slotsFor(key, now, offer.minutes).some((s) => s.time === current) ? current : null));
  };

  // Different services can be different lengths, so a chosen day or time may
  // no longer fit when the service changes.
  const changeOffer = (id) => {
    setErrors({});
    if (OFFERS[id].minutes !== offer.minutes) {
      setTime(null);
      setDateKey((current) => (current && isBookable(current, now, OFFERS[id].minutes) ? current : null));
    }
    setOfferId(id);
    if (OFFERS[id].priceKes === 0) setBundle(false);
  };

  const setDetail = (key, value) => {
    setDetails((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validateDetails = () => {
    const next = {};
    if (details.name.trim().length < 2) next.name = 'Please enter your name.';
    if (!isEmail(details.email)) next.email = 'Please enter a valid email address.';
    if (details.phone.trim() && !normalizeKenyanPhone(details.phone) && !/^\+?[\d\s\-()]{7,18}$/.test(details.phone.trim())) {
      next.phone = 'Check this number, or leave it blank.';
    }
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) document.getElementById(`bk-${first}`)?.focus();
    return !first;
  };

  const deliver = useCallback(async (record) => {
    if (record.demo) {
      setDelivery('demo');
      return;
    }
    setDelivery('sending');
    try {
      await submitBooking(record);
      setDelivery('sent');
    } catch {
      setDelivery('failed');
    }
  }, []);

  const finish = useCallback(
    (payment) => {
      const record = { ref: reference, offer, quote, instant, details, payment, demo: Boolean(payment.demo) };
      setBooking(record);
      go('done', 1);
      deliver(record);
    },
    [reference, offer, quote, instant, details, go, deliver],
  );

  const onContinue = () => {
    if (stepId === 'when') {
      if (instant) go('details', 1);
      return;
    }
    if (stepId === 'details') {
      if (!validateDetails()) return;
      if (paid) go('pay', 1);
      else finish({ method: 'none', status: 'free' });
    }
  };

  const onBack = () => {
    if (stepId === 'details') go('when', -1);
    else if (stepId === 'pay') go('details', -1);
  };

  const slide = reduce
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: direction * 36 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: direction * -36 },
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
        aria-labelledby="booking-title"
        tabIndex={-1}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 48, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.98 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="relative flex max-h-[100svh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[2rem] bg-mist-100 shadow-[0_40px_80px_-30px_rgba(29,23,38,0.7)] outline-none sm:max-h-[92svh] sm:rounded-[2rem] md:flex-row"
      >
        <SessionSummary
          offerId={offerId}
          onOfferChange={changeOffer}
          bundle={bundle}
          onBundleChange={setBundle}
          instant={instant}
          locked={stepId !== 'when'}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex items-start gap-4 px-5 pb-3 pt-5 sm:px-8 sm:pt-7">
            <div className="min-w-0 flex-1">
              {stepId !== 'done' && <StepIndicator steps={steps} current={Math.max(stepIndex, 0)} />}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close booking window"
              className="-mr-1 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-fig-800 hover:bg-moss-100"
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>

          <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 sm:px-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={stepId}
                {...slide}
                transition={{ duration: 0.28, ease: EASE }}
              >
                {stepId === 'when' && (
                  <div className="grid gap-8 lg:grid-cols-[1fr_14.5rem]">
                    <Calendar value={dateKey} onChange={pickDate} now={now} minutes={offer.minutes} />
                    <TimeSlots dateKey={dateKey} value={time} onChange={setTime} now={now} minutes={offer.minutes} />
                  </div>
                )}

                {stepId === 'details' && (
                  <div>
                    <h3 className="mb-5 font-display text-2xl text-fig-900">A little about you</h3>
                    <DetailsForm values={details} errors={errors} onChange={setDetail} discovery={!paid} />
                  </div>
                )}

                {stepId === 'pay' && (
                  <div>
                    <h3 className="mb-5 font-display text-2xl text-fig-900">Payment</h3>
                    <PaymentStep
                      offer={offer}
                      quote={quote}
                      reference={reference}
                      details={details}
                      onPaid={finish}
                      onPayLater={() => finish({ method: 'none', status: 'pay-later' })}
                    />
                  </div>
                )}

                {stepId === 'done' && booking && (
                  <Confirmation
                    booking={booking}
                    delivery={delivery}
                    onRetry={() => deliver(booking)}
                    onClose={onClose}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {(stepId === 'when' || stepId === 'details' || stepId === 'pay') && (
            <div className="flex items-center justify-between gap-3 border-t border-moss-200 bg-mist-100 px-5 py-4 sm:px-8">
              {stepId === 'when' ? (
                <Button variant="quiet" onClick={onClose}>
                  Cancel
                </Button>
              ) : (
                <Button variant="quiet" onClick={onBack}>
                  <ArrowLeft size={18} aria-hidden="true" /> Back
                </Button>
              )}

              {stepId !== 'pay' && (
                <Button size="lg" onClick={onContinue} disabled={stepId === 'when' && !instant}>
                  {stepId === 'details' && !paid ? 'Confirm booking' : stepId === 'details' ? 'Continue to payment' : 'Continue'}
                </Button>
              )}
              {stepId === 'pay' && isDemoMode() && (
                <span className="text-sm text-fig-600">Payment preview mode</span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function BookingModal() {
  const { open, offerId, bundle, closeBooking } = useBooking();
  return createPortal(
    <AnimatePresence>
      {open && <Dialog key="booking-dialog" initialOffer={offerId} initialBundle={bundle} onClose={closeBooking} />}
    </AnimatePresence>,
    document.body,
  );
}
