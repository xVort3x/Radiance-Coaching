import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Globe, Video } from 'lucide-react';
import { OFFERS, PACKAGE, SESSION_FORMAT, SITE, TIME } from '../../config/site';
import { formatDateEat, formatTimeEat } from '../../lib/dates';
import { cx } from '../../lib/cx';

// Prices are deliberately not shown here. They appear at checkout.
export default function SessionSummary({ offerId, onOfferChange, bundle, onBundleChange, instant, locked }) {
  const offer = OFFERS[offerId];

  return (
    <aside className="on-dark shrink-0 bg-fig-900 p-5 text-mist-100 md:w-[19rem] md:p-8">
      <div className="flex items-center gap-3">
        {SITE.portraitUrl && (
          <img
            src={SITE.portraitUrl}
            alt=""
            width="44"
            height="44"
            className="h-11 w-11 shrink-0 rounded-full object-cover object-[50%_18%] ring-2 ring-white/70"
          />
        )}
        <div>
          <h2 id="booking-title" className="font-display text-2xl leading-tight text-white md:text-[1.7rem]">
            Book your time
          </h2>
          <p className="text-sm text-fig-300">with {SITE.coach}</p>
        </div>
      </div>

      {/* Phones and small screens: one compact menu keeps the pop-up short. */}
      <div className="mt-4 md:hidden">
        <label htmlFor="bk-service" className="mb-1.5 block text-sm text-fig-300">
          What would you like to book?
        </label>
        <select
          id="bk-service"
          className="field"
          value={offerId}
          disabled={locked}
          onChange={(event) => onOfferChange(event.target.value)}
        >
          {Object.values(OFFERS).map((item) => (
            <option key={item.id} value={item.id}>
              {item.shortName} ({item.minutes} min)
            </option>
          ))}
        </select>
      </div>

      <div role="radiogroup" aria-label="What would you like to book?" className="mt-6 hidden space-y-2.5 md:block">
        {Object.values(OFFERS).map((item) => {
          const selected = item.id === offerId;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={locked}
              onClick={() => onOfferChange(item.id)}
              className={cx(
                'relative w-full rounded-2xl border px-4 py-3 text-left transition-colors duration-200 disabled:cursor-not-allowed',
                selected ? 'border-sun-300 bg-white/10' : 'border-fig-700 hover:border-fig-500',
                locked && !selected && 'opacity-40',
              )}
            >
              <span className="block font-medium text-white">{item.shortName}</span>
              <span className={cx('mt-0.5 block text-sm', selected ? 'text-sun-300' : 'text-fig-300')}>
                {item.id === 'discovery' ? `Free, ${item.minutes} minutes. Start here if you are not sure.` : `${item.minutes} minutes`}
              </span>
            </button>
          );
        })}
      </div>

      {offer.priceKes > 0 && (
        <div role="radiogroup" aria-label="Single session or package" className="mt-4 grid grid-cols-2 gap-2">
          {[
            { value: false, label: 'Single session' },
            { value: true, label: `${PACKAGE.sessions}-session package` },
          ].map((choice) => {
            const selected = bundle === choice.value;
            return (
              <button
                key={choice.label}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={locked}
                onClick={() => onBundleChange(choice.value)}
                className={cx(
                  'rounded-2xl border px-3 py-2.5 text-center text-sm transition-colors duration-200 disabled:cursor-not-allowed',
                  selected ? 'border-sun-300 bg-white/10 text-white' : 'border-fig-700 text-fig-200 hover:border-fig-500',
                  locked && !selected && 'opacity-40',
                )}
              >
                {choice.label}
              </button>
            );
          })}
        </div>
      )}
      {offer.priceKes > 0 && bundle && (
        <p className="mt-2 text-sm text-fig-300">
          A discounted rate on every session. You choose the first session now, and Anne arranges the rest with you.
        </p>
      )}

      <dl className="mt-6 hidden space-y-3 text-[0.925rem] text-fig-200 md:block">
        <div className="flex items-start gap-3">
          <dt className="sr-only">Length</dt>
          <Clock size={18} className="mt-0.5 shrink-0 text-sun-300" aria-hidden="true" />
          <dd>{offer.minutes} minutes</dd>
        </div>
        <div className="flex items-start gap-3">
          <dt className="sr-only">Format</dt>
          <Video size={18} className="mt-0.5 shrink-0 text-sun-300" aria-hidden="true" />
          <dd>{SESSION_FORMAT}</dd>
        </div>
        <div className="flex items-start gap-3">
          <dt className="sr-only">Time zone</dt>
          <Globe size={18} className="mt-0.5 shrink-0 text-sun-300" aria-hidden="true" />
          <dd>{TIME.label}</dd>
        </div>
      </dl>

      <div className="mt-4 rounded-2xl bg-fig-800 px-4 py-3 md:mt-6 md:py-3.5" aria-live="polite">
        <p className="text-sm text-fig-300">{bundle && offer.priceKes > 0 ? 'First session' : 'Chosen time'}</p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={instant ? instant.toISOString() : 'none'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-1 font-display text-lg leading-snug text-white md:text-xl"
          >
            {instant ? (
              <>
                {formatDateEat(instant)}
                <span className="block text-sun-300">{formatTimeEat(instant)} EAT</span>
              </>
            ) : (
              <span className="text-fig-300">Not chosen yet</span>
            )}
          </motion.p>
        </AnimatePresence>
      </div>
    </aside>
  );
}
