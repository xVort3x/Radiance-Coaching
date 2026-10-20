import { AVAILABILITY, TIME } from '../config/site';

// All booking logic works in East Africa Time (UTC+3, no daylight saving).
// Calendar days are plain 'YYYY-MM-DD' strings so browser time zones cannot
// shift a date by accident; instants (real moments in time) are only built
// when a slot is chosen.

const HOUR = 3_600_000;
const EAT_MS = TIME.offsetHours * HOUR;
const pad = (n) => String(n).padStart(2, '0');

export const toKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return { y, m: m - 1, d };
}

export function todayParts(now = new Date()) {
  const t = new Date(now.getTime() + EAT_MS);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth(), d: t.getUTCDate() };
}

export const daysInMonth = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
export const weekdayOf = (y, m, d) => new Date(Date.UTC(y, m, d)).getUTCDay();
// Monday-first column index (Mon = 0 ... Sun = 6)
export const mondayIndex = (y, m, d) => (weekdayOf(y, m, d) + 6) % 7;

export function addDays(key, n) {
  const { y, m, d } = parseKey(key);
  const t = new Date(Date.UTC(y, m, d + n));
  return toKey(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
}

export function addMonths({ y, m }, n) {
  const t = new Date(Date.UTC(y, m + n, 1));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() };
}

export const monthIndex = ({ y, m }) => y * 12 + m;

export function slotInstant(key, hhmm) {
  const { y, m, d } = parseKey(key);
  const [hh, mm] = hhmm.split(':').map(Number);
  return new Date(Date.UTC(y, m, d, hh, mm) - EAT_MS);
}

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const toHHMM = (total) => `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;

// Free start times on a day for a session of `minutes` length.
export function slotsFor(key, now = new Date(), minutes = 30) {
  if (AVAILABILITY.blockedDates.includes(key)) return [];
  const { y, m, d } = parseKey(key);
  const hours = AVAILABILITY.hours[weekdayOf(y, m, d)];
  if (!hours) return [];
  const open = toMinutes(hours.open);
  const close = toMinutes(hours.close);
  const earliest = now.getTime() + AVAILABILITY.minNoticeHours * HOUR;
  const slots = [];
  for (let start = open; start + minutes <= close; start += minutes) {
    const time = toHHMM(start);
    const instant = slotInstant(key, time);
    if (instant.getTime() >= earliest) slots.push({ time, instant });
  }
  return slots;
}

export function bookingWindow(now = new Date()) {
  const t = todayParts(now);
  const first = toKey(t.y, t.m, t.d);
  return { first, last: addDays(first, AVAILABILITY.maxAdvanceDays) };
}

export function isBookable(key, now = new Date(), minutes = 30) {
  const { first, last } = bookingWindow(now);
  if (key < first || key > last) return false;
  return slotsFor(key, now, minutes).length > 0;
}

export function firstBookableKey(now = new Date(), minutes = 30) {
  const { first } = bookingWindow(now);
  for (let i = 0; i <= AVAILABILITY.maxAdvanceDays; i += 1) {
    const key = addDays(first, i);
    if (isBookable(key, now, minutes)) return key;
  }
  return null;
}

// ── Formatting ───────────────────────────────────────────────────────────────
const fmt = (options, timeZone) => new Intl.DateTimeFormat('en-GB', { timeZone, ...options });

export const monthLabel = ({ y, m }) =>
  fmt({ month: 'long', year: 'numeric' }, 'UTC').format(new Date(Date.UTC(y, m, 1)));

export const formatDateEat = (instant) =>
  fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }, TIME.zone).format(instant);

export const formatDateShortEat = (instant) =>
  fmt({ weekday: 'short', day: 'numeric', month: 'short' }, TIME.zone).format(instant);

export const formatTimeEat = (instant) =>
  fmt({ hour: 'numeric', minute: '2-digit', hour12: true }, TIME.zone).format(instant);

export const userZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || TIME.zone;
  } catch {
    return TIME.zone;
  }
};

// True when the visitor's own clock differs from East Africa Time at that moment.
export function localDiffers(instant) {
  return userZone() !== TIME.zone && -instant.getTimezoneOffset() !== TIME.offsetHours * 60;
}

export function formatLocal(instant) {
  const zone = userZone();
  const when = fmt(
    { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true },
    zone,
  ).format(instant);
  return `${when} (${zone.replace(/_/g, ' ')})`;
}

export function formatLocalTime(instant) {
  return fmt({ hour: 'numeric', minute: '2-digit', hour12: true }, userZone()).format(instant);
}
