import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { TIME } from '../../config/site';
import {
  formatDateEat,
  formatLocalTime,
  formatTimeEat,
  localDiffers,
  slotInstant,
  slotsFor,
} from '../../lib/dates';
import { cx } from '../../lib/cx';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } };
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
};

const NO_BUSY = [];

export default function TimeSlots({ dateKey, value, onChange, now, minutes, busy = NO_BUSY }) {
  const slots = useMemo(() => (dateKey ? slotsFor(dateKey, now, minutes, busy) : []), [dateKey, now, minutes, busy]);

  if (!dateKey) {
    return (
      <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-3xl border border-dashed border-moss-300 px-6 py-10 text-center text-fig-600">
        <CalendarDays size={30} className="text-moss-400" aria-hidden="true" />
        <p className="mt-3 max-w-[16rem]">Choose a day on the calendar to see the times that are free.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 id="slots-heading" className="font-display text-2xl text-fig-900">
        {formatDateEat(slotInstant(dateKey, '12:00'))}
      </h3>
      <p className="mt-1 text-sm text-fig-600">Times are in {TIME.label}.</p>

      {slots.length === 0 && (
        <p className="mt-5 rounded-2xl border border-moss-200 bg-white px-4 py-3 text-fig-700" role="status">
          All times on this day have just been taken. Please choose another day.
        </p>
      )}

      <motion.ul
        key={dateKey}
        role="group"
        aria-labelledby="slots-heading"
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-5 grid max-h-[22rem] grid-cols-2 gap-3 overflow-y-auto p-1 pr-2"
      >
        {slots.map((slot) => {
          const selected = slot.time === value;
          return (
            <motion.li key={slot.time} variants={item}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(slot.time)}
                className={cx(
                  'w-full whitespace-nowrap rounded-2xl border px-2 py-3 text-center transition-colors duration-150',
                  selected
                    ? 'border-moss-700 bg-moss-700 text-white'
                    : 'border-moss-300 bg-white text-fig-900 hover:border-moss-600 hover:bg-moss-100',
                )}
              >
                <span className="block font-medium">{formatTimeEat(slot.instant)}</span>
                {localDiffers(slot.instant) && (
                  <span className={cx('block text-xs', selected ? 'text-moss-100' : 'text-fig-600')}>
                    Your time: {formatLocalTime(slot.instant)}
                  </span>
                )}
              </button>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
