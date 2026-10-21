import { useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  addDays,
  addMonths,
  bookingWindow,
  daysInMonth,
  firstBookableKey,
  formatDateEat,
  isBookable,
  mondayIndex,
  monthIndex,
  monthLabel,
  parseKey,
  slotInstant,
  toKey,
  todayParts,
} from '../../lib/dates';
import { cx } from '../../lib/cx';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const EASE = [0.22, 1, 0.36, 1];

const NO_BUSY = [];

export default function Calendar({ value, onChange, now, minutes, busy = NO_BUSY }) {
  const reduce = useReducedMotion();
  const today = useMemo(() => todayParts(now), [now]);
  const range = useMemo(() => bookingWindow(now), [now]);
  const lastParts = useMemo(() => parseKey(range.last), [range]);

  const [view, setView] = useState(() => {
    const start = parseKey(value || firstBookableKey(now, minutes, busy) || range.first);
    return { y: start.y, m: start.m };
  });
  const [direction, setDirection] = useState(1);
  const [roving, setRoving] = useState(null);
  const buttons = useRef({});
  const pendingFocus = useRef(null);

  const minKey = toKey(today.y, today.m, 1);
  const maxKey = toKey(lastParts.y, lastParts.m, daysInMonth(lastParts.y, lastParts.m));
  const canPrev = monthIndex(view) > monthIndex(today);
  const canNext = monthIndex(view) < monthIndex(lastParts);

  const total = daysInMonth(view.y, view.m);
  const offset = mondayIndex(view.y, view.m, 1);
  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - offset + 1;
    return day >= 1 && day <= total ? day : null;
  });

  const inView = (key) => {
    const p = parseKey(key);
    return p.y === view.y && p.m === view.m;
  };

  // Only one day is in the Tab order at a time; arrow keys move between days.
  const tabKey = (() => {
    if (roving && inView(roving)) return roving;
    if (value && inView(value)) return value;
    for (let d = 1; d <= total; d += 1) {
      const key = toKey(view.y, view.m, d);
      if (isBookable(key, now, minutes, busy)) return key;
    }
    return toKey(view.y, view.m, 1);
  })();

  const goMonth = (delta) => {
    const next = addMonths(view, delta);
    if (monthIndex(next) < monthIndex(today) || monthIndex(next) > monthIndex(lastParts)) return;
    setDirection(delta);
    setView(next);
  };

  const moveFocusTo = (target) => {
    if (target < minKey || target > maxKey) return;
    const p = parseKey(target);
    setRoving(target);
    if (p.y === view.y && p.m === view.m) {
      buttons.current[target]?.focus();
    } else {
      pendingFocus.current = target;
      setDirection(monthIndex(p) > monthIndex(view) ? 1 : -1);
      setView({ y: p.y, m: p.m });
    }
  };

  const onKeyDown = (event, key) => {
    const { y, m, d } = parseKey(key);
    const column = mondayIndex(y, m, d);
    let target = null;
    switch (event.key) {
      case 'ArrowLeft':
        target = addDays(key, -1);
        break;
      case 'ArrowRight':
        target = addDays(key, 1);
        break;
      case 'ArrowUp':
        target = addDays(key, -7);
        break;
      case 'ArrowDown':
        target = addDays(key, 7);
        break;
      case 'Home':
        target = addDays(key, -column);
        break;
      case 'End':
        target = addDays(key, 6 - column);
        break;
      case 'PageUp':
      case 'PageDown': {
        const next = addMonths({ y, m }, event.key === 'PageUp' ? -1 : 1);
        target = toKey(next.y, next.m, Math.min(d, daysInMonth(next.y, next.m)));
        break;
      }
      default:
        return;
    }
    event.preventDefault();
    moveFocusTo(target);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-2xl text-fig-900" aria-live="polite" id="calendar-heading">
          {monthLabel(view)}
        </h3>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => goMonth(-1)}
            disabled={!canPrev}
            aria-label="Previous month"
            className="flex h-10 w-10 items-center justify-center rounded-full text-fig-800 hover:bg-moss-100 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => goMonth(1)}
            disabled={!canNext}
            aria-label="Next month"
            className="flex h-10 w-10 items-center justify-center rounded-full text-fig-800 hover:bg-moss-100 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 pb-2 text-center text-xs font-medium text-fig-600" aria-hidden="true">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <motion.div
        key={`${view.y}-${view.m}`}
        role="group"
        aria-labelledby="calendar-heading"
        className="grid grid-cols-7 gap-1"
        initial={reduce ? false : { opacity: 0, x: direction * 28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        {cells.map((day, index) => {
          if (day === null) return <span key={`blank-${index}`} aria-hidden="true" />;
          const key = toKey(view.y, view.m, day);
          const available = isBookable(key, now, minutes, busy);
          const selected = key === value;
          const isToday = key === range.first;
          const label = formatDateEat(slotInstant(key, '12:00'));

          return (
            <button
              key={key}
              type="button"
              ref={(el) => {
                if (el) {
                  buttons.current[key] = el;
                  if (pendingFocus.current === key) {
                    pendingFocus.current = null;
                    el.focus();
                  }
                } else {
                  delete buttons.current[key];
                }
              }}
              tabIndex={key === tabKey ? 0 : -1}
              aria-disabled={!available}
              aria-pressed={selected}
              aria-label={`${label}${available ? '' : ', not available'}`}
              onClick={() => available && onChange(key)}
              onKeyDown={(event) => onKeyDown(event, key)}
              className={cx(
                'relative flex aspect-square items-center justify-center rounded-full text-[0.95rem] transition-colors duration-150',
                available && !selected && 'text-fig-900 hover:bg-moss-100',
                selected && 'font-medium text-white',
                !available && 'cursor-default text-fig-300',
                isToday && !selected && 'ring-1 ring-moss-400',
              )}
            >
              {selected && (
                <motion.span
                  layoutId="calendar-selected"
                  className="absolute inset-0.5 rounded-full bg-moss-700"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">{day}</span>
              {available && !selected && (
                <span
                  className="absolute bottom-1 h-1 w-1 rounded-full bg-sun-500"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </motion.div>

      <p className="mt-4 flex items-center gap-2 text-sm text-fig-600">
        <span className="h-1.5 w-1.5 rounded-full bg-sun-500" aria-hidden="true" />
        Days with a gold dot have times available
      </p>
    </div>
  );
}
