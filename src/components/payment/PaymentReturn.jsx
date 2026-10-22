import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarPlus, LoaderCircle, RotateCw } from 'lucide-react';
import { SITE } from '../../config/site';
import { formatKes } from '../../lib/format';
import { buildIcs, downloadIcs } from '../../lib/ics';
import { verifyPaystack } from '../../services/paystack';
import { calendarLocation } from '../../services/booking';
import { AnimatedCheck } from '../booking/Confirmation';
import Logo from '../art/Logo';
import Button from '../ui/Button';
import Container from '../ui/Container';
import Notice from '../ui/Notice';

const TRIES = 8; // about 30 seconds of checking before suggesting the client waits for the email
const WAIT_MS = 4000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Where Paystack sends clients after they pay. It asks the booking helper to check the payment
// with Paystack, and shows the confirmation once the money has arrived.
export default function PaymentReturn({ payRef }) {
  const [view, setView] = useState({ state: 'checking' });
  const run = useRef(0); // only the latest check may update the page (also stops double runs in dev)
  const heading = useRef(null);

  const check = useCallback(async () => {
    run.current += 1;
    const mine = run.current;
    const alive = { get current() { return run.current === mine; } };
    setView({ state: 'checking' });
    for (let attempt = 0; attempt < TRIES; attempt += 1) {
      try {
        const result = await verifyPaystack(payRef);
        if (!alive.current) return;
        if (result.state !== 'pending') {
          setView(result);
          return;
        }
      } catch {
        if (!alive.current) return;
        if (attempt === TRIES - 1) {
          setView({ state: 'network' });
          return;
        }
      }
      await sleep(WAIT_MS);
      if (!alive.current) return;
    }
    setView({ state: 'slow' });
  }, [payRef]);

  useEffect(() => {
    const previous = document.title;
    document.title = `Confirming your payment | ${SITE.name}`;
    check();
    return () => {
      run.current += 1;
      document.title = previous;
    };
  }, [check]);

  useEffect(() => {
    if (view.state !== 'checking') heading.current?.focus({ preventScroll: true });
  }, [view.state]);

  const info = view.info;
  const first = info?.name?.trim().split(/\s+/)[0];
  const copy = {
    checking: ['Confirming your payment', 'This takes a few seconds. Please keep this page open.'],
    confirmed: [
      'Payment received. Your booking is confirmed.',
      view.emailed
        ? `Thank you${first ? `, ${first}` : ''}. A confirmation with your video link is on its way to ${info?.email}.`
        : `Thank you${first ? `, ${first}` : ''}. ${SITE.coachFirstName} will email you to confirm the details.`,
    ],
    'needs-new-time': [
      'Payment received',
      'Someone else took your chosen time just before your payment arrived.',
    ],
    slow: ['Still waiting for your payment', 'Paystack has not confirmed it yet.'],
    failed: ['The payment did not go through', 'No booking was made and you have not been charged for it.'],
    problem: ['We need to check your payment', 'We could not match it automatically.'],
    network: ['We could not check your payment', 'Your connection may have dropped.'],
    not_found: ['We could not find this payment', ''],
    error: ['We could not check your payment', ''],
  }[view.state] ?? ['We could not check your payment', ''];

  const addToCalendar = () => {
    downloadIcs(
      `radiance-coaching-${info.ref}.ics`,
      buildIcs({
        ref: info.ref,
        title: `${info.service}${info.isPackage ? ` (session 1 of ${info.sessions})` : ''} with ${SITE.coach}`,
        start: new Date(info.start),
        minutes: info.minutes,
        description: `Booking reference ${info.ref}. Your video link is in your confirmation email.`,
        location: calendarLocation,
      }),
    );
  };

  return (
    <>
      <header className="border-b border-moss-200 bg-mist-100">
        <Container className="flex items-center justify-between py-4">
          <a href={window.location.pathname} aria-label={`${SITE.name}, back to the home page`}>
            <Logo />
          </a>
        </Container>
      </header>

      <main id="main" className="py-16 sm:py-24">
        <Container className="max-w-2xl">
          <div className="flex items-center gap-4">
            {view.state === 'checking' ? (
              <LoaderCircle size={44} className="shrink-0 animate-spin text-moss-600" aria-hidden="true" />
            ) : view.state === 'confirmed' ? (
              <AnimatedCheck />
            ) : null}
            <div>
              <h1 ref={heading} tabIndex={-1} className="text-3xl leading-tight text-fig-900 outline-none sm:text-4xl">
                {copy[0]}
              </h1>
              <p className="mt-1 text-fig-700" role="status" aria-live="polite">
                {copy[1]}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            {view.state === 'confirmed' && info && (
              <>
                {info.isPackage && (
                  <Notice>
                    {SITE.coachFirstName} will email you to arrange your other {info.sessions - 1} sessions. Your first
                    session is the time shown below.
                  </Notice>
                )}
                <dl className="divide-y divide-moss-200 rounded-2xl border border-moss-200 bg-white">
                  {[
                    ['Reference', info.ref],
                    ['Service', `${info.service}, ${info.minutes} minutes${info.isPackage ? ' each' : ''}`],
                    [info.isPackage ? 'First session' : 'When', info.when],
                    ['Paid', formatKes(info.total)],
                  ].map(([label, value]) => (
                    <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[8rem_1fr]">
                      <dt className="text-sm text-fig-600">{label}</dt>
                      <dd className="text-fig-900">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={addToCalendar}>
                    <CalendarPlus size={18} aria-hidden="true" /> Add to my calendar
                  </Button>
                  <Button as="a" href={window.location.pathname}>
                    Back to the website
                  </Button>
                </div>
              </>
            )}

            {view.state === 'needs-new-time' && info && (
              <Notice>
                Your payment of {formatKes(info.total)} is safe and {SITE.coachFirstName} has been told. She will contact you
                at {info.email} to choose another time that suits you. Reference {info.ref}.
              </Notice>
            )}

            {view.state === 'slow' && (
              <>
                <Notice>
                  If you have paid, there is nothing more to do. Your booking is confirmed automatically as soon as
                  Paystack tells us, and you will get an email. If you have not paid yet, you can finish on Paystack.
                </Notice>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={check}>
                    <RotateCw size={18} aria-hidden="true" /> Check again
                  </Button>
                  <Button as="a" href={window.location.pathname}>
                    Back to the website
                  </Button>
                </div>
              </>
            )}

            {(view.state === 'failed' || view.state === 'not_found') && (
              <div className="flex flex-wrap gap-3">
                <Button as="a" href={`${window.location.pathname}#book`}>
                  Book again
                </Button>
              </div>
            )}

            {(view.state === 'problem' || view.state === 'error' || view.state === 'not_found') && (
              <Notice tone="error">
                Please email{' '}
                <a className="underline" href={`mailto:${SITE.email}?subject=Payment%20${encodeURIComponent(payRef)}`}>
                  {SITE.email}
                </a>{' '}
                with the reference {payRef} and we will sort it out.
              </Notice>
            )}

            {view.state === 'network' && (
              <>
                <Notice tone="error">
                  If you paid, your booking is not lost: it will be confirmed automatically and you will get an email.
                </Notice>
                <Button variant="secondary" onClick={check}>
                  <RotateCw size={18} aria-hidden="true" /> Try again
                </Button>
              </>
            )}
          </div>
        </Container>
      </main>
    </>
  );
}
