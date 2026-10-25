import { ArrowRight, Anchor, Compass, Flower2, Sun } from 'lucide-react';
import { SERVICES } from '../../config/content';
import { OFFERS } from '../../config/site';
import { useBooking } from '../../booking/BookingContext';
import { usdPayAvailable } from '../../config/payments';
import { useUsdPay } from '../../usd/UsdPayContext';
import Container from '../ui/Container';
import { cx } from '../../lib/cx';

const ICONS = { life: Compass, grief: Flower2, betrayal: Anchor };

// The main booking entry point, placed right under the hero so it cannot be missed.
// Prices are deliberately not shown here. They appear at checkout.
export default function BookingPanel() {
  const { openBooking } = useBooking();
  const { openUsdPay } = useUsdPay();
  const discovery = OFFERS.discovery;

  const tiles = [
    {
      id: 'discovery',
      title: discovery.name,
      text: 'Not sure what you need? Start here.',
      meta: `Free, ${discovery.minutes} minutes`,
      Icon: Sun,
      highlight: true,
    },
    ...SERVICES.map((service) => ({
      id: service.offerId,
      title: service.title,
      text: service.tagline,
      meta: `${OFFERS[service.offerId].minutes} minutes, online`,
      Icon: ICONS[service.id],
      highlight: false,
    })),
  ];

  return (
    <section id="book" aria-labelledby="book-title" className="relative z-10 -mt-24 pb-4 sm:-mt-28 lg:-mt-32">
      <Container>
        <div className="rounded-[2rem] border border-moss-200 bg-surface p-6 shadow-[0_40px_80px_-40px_rgba(42,34,51,0.45)] sm:p-10">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 id="book-title" className="text-3xl leading-[1.1] text-fig-900 sm:text-4xl">
                Book your session
              </h2>
              <p className="mt-3 max-w-xl text-fig-700">
                Choose what you would like to book, then pick a time that suits you.
              </p>
            </div>
            <p className="text-[0.95rem] text-fig-600 lg:max-w-xs lg:text-right">
              Monday to Friday, 10 am to 7 pm. Saturday, 11:30 am to 6 pm. East Africa Time.
            </p>
          </div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tiles.map(({ id, title, text, meta, Icon, highlight }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => openBooking(id)}
                  className={cx(
                    'group flex h-full w-full flex-col rounded-3xl border p-5 text-left transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5',
                    highlight
                      ? 'border-sun-300 bg-sun-100 hover:bg-sun-200'
                      : 'border-moss-200 bg-mist-50 hover:border-moss-400 hover:bg-moss-100',
                  )}
                >
                  <span
                    className={cx(
                      'flex h-11 w-11 items-center justify-center rounded-full',
                      highlight ? 'bg-sun-400 text-ink' : 'bg-moss-100 text-moss-700 group-hover:bg-surface',
                    )}
                  >
                    <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <span className="mt-5 font-display text-2xl leading-tight text-fig-900">{title}</span>
                  <span className="mt-2 text-[0.95rem] text-fig-700">{text}</span>
                  <span className="mt-5 flex items-center justify-between gap-3 pt-1 text-sm font-medium text-fig-800">
                    {meta}
                    <span
                      className={cx(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:translate-x-0.5',
                        highlight ? 'bg-night text-white' : 'bg-action text-white',
                      )}
                    >
                      <ArrowRight size={17} aria-hidden="true" />
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-[0.95rem] text-fig-600">
            Booking five sessions together? Choose a service, then choose the 5-session package for a
            discounted rate.
            {usdPayAvailable() && (
              <>
                {' '}
                Paying from abroad?{' '}
                <button type="button" onClick={openUsdPay} className="font-medium text-moss-800 underline decoration-moss-300 underline-offset-4 hover:decoration-moss-700">
                  Pay in USD
                </button>
                .
              </>
            )}
          </p>
        </div>
      </Container>
    </section>
  );
}
