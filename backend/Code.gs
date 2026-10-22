/**
 * Radiance Coaching: booking helper (Google Apps Script)
 *
 * What it does for the website:
 *  1. Keeps every booking in a Google Sheet in Anne's Google Drive.
 *  2. Tells the website which times are already taken, so nobody can double-book.
 *  3. Holds a time for 15 minutes while a client is paying.
 *  4. Emails the client a confirmation (with a calendar invite attached) and emails Anne.
 *  5. Sends the website's contact-form messages to Anne.
 *
 * Setup is in the README ("Bookings and confirmation emails"). The only thing you
 * must edit below is MEETING_LINK.
 */

var CONFIG = {
  COACH_NAME: 'Anne Kibet',
  BUSINESS_NAME: 'Radiance Coaching',
  // Anne's inbox. Notifications go here and clients can reply to her.
  COACH_EMAIL: 'info.radiancecoaching@gmail.com',
  // The video link clients receive. Paste a Google Meet or Zoom link between the quotes.
  MEETING_LINK: 'PASTE YOUR GOOGLE MEET OR ZOOM LINK HERE',
  SITE_URL: 'https://radiancecoaching.co.ke',
  // Optional: Anne's WhatsApp number as digits with country code, e.g. 254712345678. Blank = not shown.
  WHATSAPP: '',
  TIMEZONE: 'Africa/Nairobi',
  HOLD_MINUTES: 15,
  RESCHEDULE_NOTICE_HOURS: 24,
  // Server-side checks. These should match src/config/site.js on the website.
  MIN_NOTICE_HOURS: 24,
  MAX_ADVANCE_DAYS: 60,
  // Monday = 1 ... Sunday = 7. Times are East Africa Time. null = closed.
  HOURS: {
    1: ['10:00', '19:00'],
    2: ['10:00', '19:00'],
    3: ['10:00', '19:00'],
    4: ['10:00', '19:00'],
    5: ['10:00', '19:00'],
    6: ['11:30', '18:00'],
    7: null,
  },
  ALLOWED_MINUTES: [30, 60],
  // Online payments through Paystack (card and M-Pesa). These prices must match src/config/site.js.
  // The secret key is NOT stored here: see the README, "Paystack".
  OFFERS: {
    discovery: { name: 'Free discovery call', minutes: 30, price: 0 },
    life: { name: 'Life Coaching', minutes: 60, price: 5000 },
    grief: { name: 'Grief and End-of-Life Coaching', minutes: 60, price: 5000 },
    betrayal: { name: 'Betrayal Trauma Coaching', minutes: 60, price: 5000 },
  },
  PACKAGE_SESSIONS: 5,
  PACKAGE_DISCOUNT_PER_SESSION: 250,
  // How long a time is kept for someone who has been sent to Paystack to pay.
  PAYMENT_HOLD_MINUTES: 45,
  // Where Paystack may send clients back to after they pay.
  ALLOWED_RETURN: /^https:\/\/(radiancecoaching\.co\.ke|www\.radiancecoaching\.co\.ke|[a-z0-9-]+\.github\.io)(\/|$)/i,
};

var COL = {
  ref: 0, status: 1, created: 2, when: 3, service: 4, pkg: 5, total: 6, name: 7, email: 8,
  phone: 9, notes: 10, payment: 11, receipt: 12, start: 13, end: 14, holdUntil: 15, minutes: 16,
  offerId: 17, isPackage: 18, sessions: 19, each: 20, localTime: 21, payRef: 22,
};
var BOOKING_HEADERS = [
  'Reference', 'Status', 'Booked on', 'Session (East Africa Time)', 'Service', 'Package', 'Total (KSh)',
  'Name', 'Email', 'Phone', 'Notes from client', 'Payment', 'Payment code',
  'Start (ms)', 'End (ms)', 'Hold until (ms)', 'Minutes',
  'Service id', 'Is package', 'Sessions', 'Each (KSh)', 'Client local time', 'Paystack reference',
];
var MINUTE_MS = 60000;
var HOUR_MS = 3600000;

// ───────────────────────────── Web app entry points ─────────────────────────────

function doGet(e) {
  try {
    var action = e && e.parameter && e.parameter.action;
    if (action === 'busy') return json_({ ok: true, busy: busyIntervals_(Date.now()), now: Date.now() });
    return json_({ ok: true, service: CONFIG.BUSINESS_NAME + ' bookings' });
  } catch (err) {
    return json_({ ok: false, code: 'error', message: String(err && err.message ? err.message : err) });
  }
}

function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    // Hidden field that real visitors never fill in. Bots do.
    if (data.website) return json_({ ok: true });
    if (data.action === 'hold') return json_(holdSlot_(data));
    if (data.action === 'book') return json_(bookSlot_(data));
    if (data.action === 'contact') return json_(contact_(data));
    if (data.action === 'payinit') return json_(payInit_(data));
    if (data.action === 'payverify') return json_(payVerify_(data));
    return json_({ ok: false, code: 'bad_request', message: 'Unknown action.' });
  } catch (err) {
    return json_({ ok: false, code: 'error', message: String(err && err.message ? err.message : err) });
  }
}

function json_(object) {
  return ContentService.createTextOutput(JSON.stringify(object)).setMimeType(ContentService.MimeType.JSON);
}

// Run this once from the editor (see the README). It creates the booking sheet and
// sends a test email to Anne, which also grants the permissions the script needs.
function setup() {
  var ss = getSpreadsheet_();
  MailApp.sendEmail({
    to: CONFIG.COACH_EMAIL,
    subject: CONFIG.BUSINESS_NAME + ': booking helper is working',
    body:
      'The booking helper is set up.\n\nYour bookings sheet: ' + ss.getUrl() +
      '\n\nNext: deploy this script as a web app and copy its address into the website settings (see the README).',
  });
  Logger.log('Bookings sheet: ' + ss.getUrl());
  enableAutoChecks();
}

// Checks every few minutes for clients who paid on Paystack but did not come back
// to the website, and confirms their bookings. setup() turns this on.
function enableAutoChecks() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'reconcilePayments') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('reconcilePayments').timeBased().everyMinutes(5).create();
}

// ───────────────────────────── Sheet storage ─────────────────────────────

var spreadsheetCache_ = null;

function getSpreadsheet_() {
  if (spreadsheetCache_) return spreadsheetCache_;
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  var ss = null;
  if (id) {
    try {
      ss = SpreadsheetApp.openById(id);
    } catch (err) {
      ss = null;
    }
  }
  if (!ss) {
    ss = SpreadsheetApp.create(CONFIG.BUSINESS_NAME + ' bookings');
    ss.setSpreadsheetTimeZone(CONFIG.TIMEZONE);
    props.setProperty('SHEET_ID', ss.getId());
  }
  var bookings = ss.getSheetByName('Bookings');
  if (!bookings) {
    bookings = ss.getSheets()[0];
    bookings.setName('Bookings');
    bookings.getRange(1, 1, 1, BOOKING_HEADERS.length).setValues([BOOKING_HEADERS]).setFontWeight('bold');
    bookings.setFrozenRows(1);
  }
  var blocked = ss.getSheetByName('Blocked');
  if (!blocked) {
    blocked = ss.insertSheet('Blocked');
    blocked.getRange(1, 1, 1, 3).setValues([['Start (date and time)', 'End (date and time)', 'Note']]).setFontWeight('bold');
    blocked.getRange(2, 1, 1, 3).setValues([['Type a start date and time here', 'Type an end date and time here', 'Delete this row. Add each day off or holiday on its own row.']]);
    blocked.setFrozenRows(1);
  }
  spreadsheetCache_ = ss;
  return ss;
}

function bookingsSheet_() {
  return getSpreadsheet_().getSheetByName('Bookings');
}

function readBookings_() {
  var sheet = bookingsSheet_();
  var rows = sheet.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < rows.length; i += 1) {
    var r = rows[i];
    if (!r[COL.ref]) continue;
    out.push({
      row: i + 1,
      ref: String(r[COL.ref]),
      status: String(r[COL.status]).toLowerCase(),
      email: String(r[COL.email] || ''),
      start: Number(r[COL.start]),
      end: Number(r[COL.end]),
      holdUntil: Number(r[COL.holdUntil]) || 0,
      name: String(r[COL.name] || ''),
      phone: String(r[COL.phone] || ''),
      notes: String(r[COL.notes] || ''),
      service: String(r[COL.service] || ''),
      total: Number(r[COL.total]) || 0,
      minutes: Number(r[COL.minutes]) || 0,
      offerId: String(r[COL.offerId] || ''),
      isPackage: String(r[COL.isPackage]) === 'yes',
      sessions: Number(r[COL.sessions]) || 1,
      each: Number(r[COL.each]) || 0,
      localTime: String(r[COL.localTime] || ''),
      payRef: String(r[COL.payRef] || ''),
    });
  }
  return out;
}

function readBlocked_() {
  var sheet = getSpreadsheet_().getSheetByName('Blocked');
  var rows = sheet.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < rows.length; i += 1) {
    var start = toMs_(rows[i][0]);
    var end = toMs_(rows[i][1]);
    if (isFinite(start) && isFinite(end) && end > start) out.push({ start: start, end: end });
  }
  return out;
}

function toMs_(value) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  // Typed text such as 2026-12-24 or 2026-12-24 09:30 is read as East Africa Time.
  var m = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?$/);
  if (!m) return NaN;
  var hh = ('0' + (m[4] || '0')).slice(-2);
  return Date.parse(m[1] + '-' + m[2] + '-' + m[3] + 'T' + hh + ':' + (m[5] || '00') + ':00+03:00');
}

function isActive_(b, nowMs) {
  if (b.status === 'confirmed') return true;
  if (b.status === 'hold' || b.status === 'awaiting-payment') return b.holdUntil > nowMs;
  return false;
}

// Times the website must show as taken: confirmed sessions, live holds, and blocked time.
function busyIntervals_(nowMs) {
  var list = [];
  readBookings_().forEach(function (b) {
    if (isActive_(b, nowMs) && b.end > nowMs) list.push({ start: b.start, end: b.end });
  });
  readBlocked_().forEach(function (b) {
    if (b.end > nowMs) list.push(b);
  });
  return list;
}

function overlaps_(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function isFree_(startMs, endMs, nowMs, ignoreRef) {
  var bookings = readBookings_();
  for (var i = 0; i < bookings.length; i += 1) {
    var b = bookings[i];
    if (ignoreRef && b.ref === ignoreRef) continue;
    if (isActive_(b, nowMs) && overlaps_(startMs, endMs, b.start, b.end)) return false;
  }
  var blocked = readBlocked_();
  for (var j = 0; j < blocked.length; j += 1) {
    if (overlaps_(startMs, endMs, blocked[j].start, blocked[j].end)) return false;
  }
  return true;
}

function setStatus_(row, status) {
  bookingsSheet_().getRange(row, COL.status + 1).setValue(status);
}

// Tidy up: mark holds that ran out so the sheet stays readable.
function expireHolds_(nowMs) {
  readBookings_().forEach(function (b) {
    if (b.status === 'hold' && b.holdUntil <= nowMs) setStatus_(b.row, 'expired');
  });
}

// ───────────────────────────── Validation ─────────────────────────────

function clean_(value, max) {
  return String(value == null ? '' : value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ' ').trim().slice(0, max);
}

function cleanLine_(value, max) {
  return clean_(value, max).replace(/[\r\n]+/g, ' ');
}

function validEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function eatParts_(ms) {
  var f = function (pattern) {
    return Utilities.formatDate(new Date(ms), CONFIG.TIMEZONE, pattern);
  };
  return { weekday: Number(f('u')), minutes: Number(f('HH')) * 60 + Number(f('mm')) };
}

function hhmm_(text) {
  var p = text.split(':');
  return Number(p[0]) * 60 + Number(p[1]);
}

// Returns a message when the requested time breaks the booking rules, otherwise null.
function slotProblem_(startMs, minutes, nowMs) {
  if (!isFinite(startMs)) return 'Missing time.';
  if (CONFIG.ALLOWED_MINUTES.indexOf(minutes) === -1) return 'Unknown session length.';
  if (startMs < nowMs + (CONFIG.MIN_NOTICE_HOURS - 1) * HOUR_MS) return 'That time is too soon to book.';
  if (startMs > nowMs + (CONFIG.MAX_ADVANCE_DAYS + 1) * 24 * HOUR_MS) return 'That time is too far ahead.';
  var parts = eatParts_(startMs);
  var hours = CONFIG.HOURS[parts.weekday];
  if (!hours) return 'Anne is not available that day.';
  if (parts.minutes < hhmm_(hours[0]) || parts.minutes + minutes > hhmm_(hours[1])) return 'That time is outside Anne\'s hours.';
  return null;
}

function readSlot_(data, nowMs) {
  var startMs = Number(data.start);
  var minutes = Number(data.minutes);
  var problem = slotProblem_(startMs, minutes, nowMs);
  if (problem) return { error: problem };
  return { startMs: startMs, endMs: startMs + minutes * MINUTE_MS, minutes: minutes };
}

function readRef_(data) {
  var ref = cleanLine_(data.ref, 24);
  return /^[A-Za-z0-9\-]{4,24}$/.test(ref) ? ref : '';
}

// ───────────────────────────── Hold and book ─────────────────────────────

function withLock_(work) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    return work();
  } finally {
    lock.releaseLock();
  }
}

function holdSlot_(data) {
  var nowMs = Date.now();
  var ref = readRef_(data);
  var email = cleanLine_(data.email, 120).toLowerCase();
  if (!ref) return { ok: false, code: 'bad_request', message: 'Missing reference.' };
  var slot = readSlot_(data, nowMs);
  if (slot.error) return { ok: false, code: 'invalid', message: slot.error };

  return withLock_(function () {
    expireHolds_(nowMs);
    var bookings = readBookings_();
    // A new choice replaces the same visitor's earlier hold.
    bookings.forEach(function (b) {
      if (b.ref === ref && b.status === 'hold') setStatus_(b.row, 'released');
    });
    var live = bookings.filter(function (b) {
      return (b.status === 'hold' || b.status === 'awaiting-payment') && b.holdUntil > nowMs && b.ref !== ref;
    });
    if (live.length >= 40) return { ok: false, code: 'busy', message: 'Please try again in a few minutes.' };
    if (email && live.filter(function (b) { return b.email.toLowerCase() === email; }).length >= 3) {
      return { ok: false, code: 'busy', message: 'Too many held times for this email. Please try again soon.' };
    }
    if (!isFree_(slot.startMs, slot.endMs, nowMs, ref)) return { ok: false, code: 'taken' };

    var holdUntil = nowMs + CONFIG.HOLD_MINUTES * MINUTE_MS;
    bookingsSheet_().appendRow(
      rowFor_({
        ref: ref, status: 'hold', nowMs: nowMs, slot: slot, email: email,
        service: cleanLine_(data.offerName, 80), holdUntil: holdUntil,
      }),
    );
    return { ok: true, holdMinutes: CONFIG.HOLD_MINUTES };
  });
}

function rowFor_(b) {
  var row = new Array(BOOKING_HEADERS.length).fill('');
  row[COL.ref] = b.ref;
  row[COL.status] = b.status;
  row[COL.created] = Utilities.formatDate(new Date(b.nowMs), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm');
  row[COL.when] = whenText_(b.slot.startMs);
  row[COL.service] = b.service || '';
  row[COL.pkg] = b.pkg || '';
  row[COL.total] = b.total === undefined ? '' : b.total;
  row[COL.name] = b.name || '';
  row[COL.email] = b.email || '';
  row[COL.phone] = b.phone || '';
  row[COL.notes] = b.notes || '';
  row[COL.payment] = b.payment || '';
  row[COL.receipt] = b.receipt || '';
  row[COL.start] = b.slot.startMs;
  row[COL.end] = b.slot.endMs;
  row[COL.holdUntil] = b.holdUntil || '';
  row[COL.minutes] = b.slot.minutes;
  row[COL.offerId] = b.offerId || '';
  row[COL.isPackage] = b.isPackage ? 'yes' : '';
  row[COL.sessions] = b.sessions || '';
  row[COL.each] = b.each || '';
  row[COL.localTime] = b.localTime || '';
  row[COL.payRef] = b.payRef || '';
  return row;
}

function bookSlot_(data) {
  var nowMs = Date.now();
  var ref = readRef_(data);
  var name = cleanLine_(data.name, 80);
  var email = cleanLine_(data.email, 120).toLowerCase();
  if (!ref || name.length < 2 || !validEmail_(email)) return { ok: false, code: 'bad_request', message: 'Missing details.' };
  var slot = readSlot_(data, nowMs);
  if (slot.error) return { ok: false, code: 'invalid', message: slot.error };

  var paymentStatus = cleanLine_(data.payment && data.payment.status, 40);
  var paidFlow = paymentStatus && paymentStatus !== 'free';
  var booking = {
    ref: ref,
    nowMs: nowMs,
    slot: slot,
    name: name,
    email: email,
    phone: cleanLine_(data.phone, 40),
    notes: clean_(data.notes, 700),
    service: cleanLine_(data.offerName, 80),
    isPackage: Boolean(data.isPackage),
    sessions: Number(data.sessions) || 1,
    total: Number(data.total) || 0,
    each: Number(data.each) || 0,
    discovery: Boolean(data.discovery),
    paymentText: cleanLine_(data.paymentText, 160),
    receipt: cleanLine_(data.payment && data.payment.receipt, 40),
    localTime: cleanLine_(data.localTime, 80),
  };
  booking.pkg = booking.isPackage ? booking.sessions + ' sessions at KSh ' + booking.each : '';

  var outcome = withLock_(function () {
    expireHolds_(nowMs);
    var existing = readBookings_().filter(function (b) { return b.ref === ref; });
    if (existing.some(function (b) { return b.status === 'confirmed' || b.status === 'needs-new-time'; })) {
      return { ok: true, duplicate: true, emailed: false };
    }
    var free = isFree_(slot.startMs, slot.endMs, nowMs, ref);
    var status = free ? 'confirmed' : 'needs-new-time';
    if (!free && !paidFlow) return { ok: false, code: 'taken' };

    existing.forEach(function (b) {
      if (b.status === 'hold') setStatus_(b.row, 'released');
    });
    bookingsSheet_().appendRow(
      rowFor_({
        ref: ref, status: status, nowMs: nowMs, slot: slot, name: booking.name, email: booking.email,
        phone: booking.phone, notes: booking.notes, service: booking.service, pkg: booking.pkg,
        total: booking.total, payment: booking.paymentText, receipt: booking.receipt,
        offerId: cleanLine_(data.offerId, 20), isPackage: booking.isPackage, sessions: booking.sessions,
        each: booking.each, localTime: booking.localTime,
      }),
    );
    return { ok: true, status: status };
  });

  if (!outcome.ok || outcome.duplicate) return outcome;
  if (outcome.status === 'needs-new-time') {
    safely_(function () { sendCoachEmail_(booking, true); });
    return { ok: true, rescheduling: true, emailed: false };
  }
  var coachSent = safely_(function () { sendCoachEmail_(booking, false); });
  var clientSent = safely_(function () { sendClientEmail_(booking); });
  return { ok: true, emailed: clientSent, coachNotified: coachSent };
}

function safely_(work) {
  try {
    work();
    return true;
  } catch (err) {
    Logger.log('Email problem: ' + err);
    return false;
  }
}

// ───────────────────────────── Contact form ─────────────────────────────

function contact_(data) {
  var name = cleanLine_(data.name, 80);
  var email = cleanLine_(data.email, 120);
  var message = clean_(data.message, 4000);
  if (name.length < 1 || !validEmail_(email) || message.length < 5) return { ok: false, code: 'bad_request', message: 'Missing details.' };
  var cache = CacheService.getScriptCache();
  var key = 'contact_' + email.toLowerCase().slice(0, 80);
  if (cache.get(key)) return { ok: false, code: 'busy', message: 'Please wait a moment before sending again.' };
  cache.put(key, '1', 30);
  MailApp.sendEmail({
    to: CONFIG.COACH_EMAIL,
    replyTo: email,
    name: CONFIG.BUSINESS_NAME + ' website',
    subject: 'Message from ' + name + ' via the ' + CONFIG.BUSINESS_NAME + ' website',
    body: 'From: ' + name + ' <' + email + '>\n\n' + message + '\n\n(Reply to this email to answer them.)',
  });
  return { ok: true };
}

// ───────────────────────────── Emails ─────────────────────────────

function whenText_(startMs) {
  var date = Utilities.formatDate(new Date(startMs), CONFIG.TIMEZONE, 'EEEE d MMMM yyyy');
  var time = Utilities.formatDate(new Date(startMs), CONFIG.TIMEZONE, 'h:mm a').toLowerCase();
  return date + ', ' + time + ' EAT';
}

function esc_(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function changeTimeText_() {
  var how = CONFIG.WHATSAPP ? 'Reply to this email, or message us on WhatsApp (+' + CONFIG.WHATSAPP + '), ' : 'Reply to this email ';
  return 'Need to change the time? ' + how + 'at least ' + CONFIG.RESCHEDULE_NOTICE_HOURS + ' hours before and we will find another time.';
}

function hasMeetingLink_() {
  return /^https?:\/\//i.test(CONFIG.MEETING_LINK);
}

function expectText_(b) {
  if (b.discovery) {
    return 'This is a relaxed 30-minute conversation. There is nothing to prepare. Tell Anne a little about what is going on, ask anything you like, and together you will see what kind of support fits.';
  }
  return 'Your session is ' + b.slot.minutes + ' minutes, one-to-one, on video. There is nothing to prepare. Come as you are, and share only what feels right. Anne listens first and goes at your pace.';
}

function icsFor_(b) {
  var stamp = function (ms) {
    return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };
  var where = hasMeetingLink_() ? CONFIG.MEETING_LINK : 'Video call';
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Radiance Coaching//Booking//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:' + b.ref + '@radiancecoaching',
    'DTSTAMP:' + stamp(Date.now()),
    'DTSTART:' + stamp(b.slot.startMs),
    'DTEND:' + stamp(b.slot.endMs),
    'SUMMARY:' + b.service + ' with ' + CONFIG.COACH_NAME,
    'DESCRIPTION:Booking reference ' + b.ref + '. ' + (hasMeetingLink_() ? 'Join: ' + CONFIG.MEETING_LINK : ''),
    'LOCATION:' + where,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

function sendClientEmail_(b) {
  var first = b.name.split(/\s+/)[0];
  var when = whenText_(b.slot.startMs);
  var link = hasMeetingLink_() ? CONFIG.MEETING_LINK : '';
  var lines = [
    'Hi ' + first + ',',
    '',
    'Thank you for booking with ' + CONFIG.BUSINESS_NAME + '. Your time is reserved.',
    '',
    b.isPackage ? 'First session: ' + when : 'When: ' + when,
  ];
  if (b.localTime) lines.push('Your local time: ' + b.localTime);
  lines.push('Service: ' + b.service + ', ' + b.slot.minutes + ' minutes' + (b.isPackage ? ' each' : ''));
  if (b.isPackage) {
    lines.push(
      'Package: ' + b.sessions + ' sessions. Anne will email you to arrange the other ' + (b.sessions - 1) + '.',
    );
  }
  lines.push('Reference: ' + b.ref, '');
  lines.push(link ? 'Join the video call here:\n' + link : 'Anne will send your video link before the session.', '');
  lines.push('What to expect', expectText_(b), '');
  if (b.paymentText && !b.discovery) {
    lines.push('Payment: ' + b.paymentText, '');
  }
  lines.push(
    changeTimeText_(),
    '',
    'Warmly,',
    CONFIG.COACH_NAME,
    CONFIG.BUSINESS_NAME,
    CONFIG.SITE_URL,
  );
  var text = lines.join('\n');

  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;color:#2A2233;line-height:1.55;max-width:560px">' +
    '<p>Hi ' + esc_(first) + ',</p>' +
    '<p>Thank you for booking with ' + esc_(CONFIG.BUSINESS_NAME) + '. Your time is reserved.</p>' +
    '<table style="border-collapse:collapse;margin:16px 0;width:100%">' +
    row_(b.isPackage ? 'First session' : 'When', when) +
    (b.localTime ? row_('Your local time', b.localTime) : '') +
    row_('Service', b.service + ', ' + b.slot.minutes + ' minutes' + (b.isPackage ? ' each' : '')) +
    (b.isPackage ? row_('Package', b.sessions + ' sessions. Anne will email you to arrange the other ' + (b.sessions - 1) + '.') : '') +
    row_('Reference', b.ref) +
    '</table>' +
    (link
      ? '<p><a href="' + esc_(link) + '" style="background:#2F4A3F;color:#ffffff;padding:12px 22px;border-radius:999px;text-decoration:none;display:inline-block">Join the video call</a></p>' +
        '<p style="font-size:13px;color:#5b5266">Or copy this link: ' + esc_(link) + '</p>'
      : '<p>Anne will send your video link before the session.</p>') +
    '<h3 style="margin:24px 0 6px;font-size:16px">What to expect</h3>' +
    '<p style="margin:0">' + esc_(expectText_(b)) + '</p>' +
    (b.paymentText && !b.discovery ? '<p><strong>Payment:</strong> ' + esc_(b.paymentText) + '</p>' : '') +
    '<p>' + esc_(changeTimeText_()) + '</p>' +
    '<p>Warmly,<br>' + esc_(CONFIG.COACH_NAME) + '<br>' + esc_(CONFIG.BUSINESS_NAME) + '<br>' +
    '<a href="' + esc_(CONFIG.SITE_URL) + '">' + esc_(CONFIG.SITE_URL) + '</a></p></div>';

  MailApp.sendEmail({
    to: b.email,
    replyTo: CONFIG.COACH_EMAIL,
    name: CONFIG.COACH_NAME + ' (' + CONFIG.BUSINESS_NAME + ')',
    subject: 'Your session is booked: ' + when,
    body: text,
    htmlBody: html,
    attachments: [Utilities.newBlob(icsFor_(b), 'text/calendar', 'radiance-coaching-' + b.ref + '.ics')],
  });
}

function row_(label, value) {
  return (
    '<tr><td style="padding:6px 12px 6px 0;color:#5b5266;vertical-align:top;white-space:nowrap">' + esc_(label) +
    '</td><td style="padding:6px 0">' + esc_(value) + '</td></tr>'
  );
}

function sendCoachEmail_(b, needsNewTime) {
  var lines = [];
  if (needsNewTime) {
    lines.push(
      'ACTION NEEDED: this client chose a time that was taken by someone else while they were paying.',
      'Please contact them to choose another time. Their request is in the sheet with the status "needs-new-time".',
      '',
    );
  }
  lines.push(
    'Booking reference: ' + b.ref,
    'Service: ' + b.service + ', ' + b.slot.minutes + ' minutes' + (b.isPackage ? ' each' : ''),
  );
  if (b.isPackage) {
    lines.push(
      'Package: ' + b.sessions + ' sessions at KSh ' + b.each + ' each, total KSh ' + b.total,
      'ACTION: arrange the other ' + (b.sessions - 1) + ' sessions with the client.',
    );
  } else if (!b.discovery) {
    lines.push('Cost: KSh ' + b.total);
  }
  lines.push((b.isPackage ? 'First session: ' : 'When: ') + whenText_(b.slot.startMs));
  if (b.localTime) lines.push('Client local time: ' + b.localTime);
  lines.push('', 'Name: ' + b.name, 'Email: ' + b.email, 'Phone: ' + (b.phone || 'Not given'));
  if (b.notes) lines.push('', 'Notes from the client:', b.notes);
  if (!b.discovery) lines.push('', 'Payment: ' + (b.paymentText || 'Not recorded'));
  if (b.receipt) lines.push('Payment code: ' + b.receipt);
  lines.push('', 'The booking is also in your bookings sheet. Reply to this email to write to the client.');
  MailApp.sendEmail({
    to: CONFIG.COACH_EMAIL,
    replyTo: b.email,
    name: CONFIG.BUSINESS_NAME + ' website',
    subject: (needsNewTime ? 'ACTION NEEDED: ' : 'New booking: ') + b.service + ' with ' + b.name + ' (' + b.ref + ')',
    body: lines.join('\n'),
  });
}

// ───────────────────────────── Online payments (Paystack) ─────────────────────────────
// Card and M-Pesa are paid on Paystack's own secure page. The website sends the client there
// with payInit_, and when the client comes back it asks payVerify_ whether the money arrived.
// Every amount is checked here against Paystack, so the website cannot be tricked into
// confirming an unpaid booking. reconcilePayments() catches clients who paid but never came back.

function paystackKey_() {
  return PropertiesService.getScriptProperties().getProperty('PAYSTACK_SECRET_KEY') || '';
}

function paystackCall_(method, path, body) {
  var options = {
    method: method,
    headers: { Authorization: 'Bearer ' + paystackKey_() },
    muteHttpExceptions: true,
  };
  if (body) {
    options.contentType = 'application/json';
    options.payload = JSON.stringify(body);
  }
  var response = UrlFetchApp.fetch('https://api.paystack.co' + path, options);
  var parsed = {};
  try {
    parsed = JSON.parse(response.getContentText());
  } catch (err) {
    parsed = {};
  }
  return { code: response.getResponseCode(), body: parsed };
}

function updateRow_(rowNumber, fields) {
  var sheet = bookingsSheet_();
  Object.keys(fields).forEach(function (key) {
    sheet.getRange(rowNumber, COL[key] + 1).setValue(fields[key]);
  });
}

function infoFor_(row) {
  return {
    ref: row.ref,
    when: whenText_(row.start),
    service: row.service,
    minutes: row.minutes,
    isPackage: row.isPackage,
    sessions: row.sessions,
    email: row.email,
    name: row.name,
    start: row.start,
    total: row.total,
  };
}

function bookingFromRow_(row, paymentText, receipt) {
  return {
    ref: row.ref,
    nowMs: Date.now(),
    slot: { startMs: row.start, endMs: row.end, minutes: row.minutes },
    name: row.name,
    email: row.email.toLowerCase(),
    phone: row.phone,
    notes: row.notes,
    service: row.service,
    isPackage: row.isPackage,
    sessions: row.sessions,
    total: row.total,
    each: row.each,
    discovery: false,
    paymentText: paymentText,
    receipt: receipt,
    localTime: row.localTime,
  };
}

function payInit_(data) {
  var nowMs = Date.now();
  var ref = readRef_(data);
  var name = cleanLine_(data.name, 80);
  var email = cleanLine_(data.email, 120).toLowerCase();
  var offerId = cleanLine_(data.offerId, 20);
  var offer = CONFIG.OFFERS[offerId];
  if (!ref || name.length < 2 || !validEmail_(email) || !offer || offer.price <= 0) {
    return { ok: false, code: 'bad_request', message: 'Missing details.' };
  }
  if (!paystackKey_()) return { ok: false, code: 'not_configured', message: 'Online payments are not switched on yet.' };
  var slot = readSlot_({ start: data.start, minutes: offer.minutes }, nowMs);
  if (slot.error) return { ok: false, code: 'invalid', message: slot.error };

  // The price is worked out here, never taken from the website.
  var isPackage = Boolean(data.isPackage);
  var sessions = isPackage ? CONFIG.PACKAGE_SESSIONS : 1;
  var each = offer.price - (isPackage ? CONFIG.PACKAGE_DISCOUNT_PER_SESSION : 0);
  var total = each * sessions;

  var back = String(data.returnUrl || '').split('#')[0].split('?')[0];
  var returnUrl = back.length < 200 && /^\S+$/.test(back) && CONFIG.ALLOWED_RETURN.test(back) ? back : CONFIG.SITE_URL + '/';

  var outcome = withLock_(function () {
    expireHolds_(nowMs);
    var bookings = readBookings_();
    var mine = bookings.filter(function (b) { return b.ref === ref; });
    if (mine.some(function (b) { return b.status === 'confirmed'; })) return { ok: false, code: 'already_booked' };
    var live = bookings.filter(function (b) {
      return (b.status === 'hold' || b.status === 'awaiting-payment') && b.holdUntil > nowMs && b.ref !== ref;
    });
    if (live.length >= 40) return { ok: false, code: 'busy', message: 'Please try again in a few minutes.' };
    if (live.filter(function (b) { return b.email.toLowerCase() === email; }).length >= 3) {
      return { ok: false, code: 'busy', message: 'Too many pending payments for this email. Please try again soon.' };
    }
    if (!isFree_(slot.startMs, slot.endMs, nowMs, ref)) return { ok: false, code: 'taken' };

    mine.forEach(function (b) {
      if (b.status === 'hold' || b.status === 'awaiting-payment') setStatus_(b.row, 'released');
    });
    var payRef = ref + '-' + (mine.filter(function (b) { return b.payRef; }).length + 1);
    bookingsSheet_().appendRow(
      rowFor_({
        ref: ref, status: 'awaiting-payment', nowMs: nowMs, slot: slot, name: name, email: email,
        phone: cleanLine_(data.phone, 40), notes: clean_(data.notes, 700), service: offer.name,
        pkg: isPackage ? sessions + ' sessions at KSh ' + each : '', total: total,
        payment: 'Waiting for payment on Paystack', holdUntil: nowMs + CONFIG.PAYMENT_HOLD_MINUTES * MINUTE_MS,
        offerId: offerId, isPackage: isPackage, sessions: sessions, each: each,
        localTime: cleanLine_(data.localTime, 80), payRef: payRef,
      }),
    );
    return { ok: true, payRef: payRef };
  });
  if (!outcome.ok) return outcome;

  var res = paystackCall_('post', '/transaction/initialize', {
    email: email,
    amount: String(total * 100),
    currency: 'KES',
    reference: outcome.payRef,
    callback_url: returnUrl,
    metadata: JSON.stringify({ booking: ref, service: offer.name, client: name }),
  });
  var checkout = res.body && res.body.data && res.body.data.authorization_url;
  if (res.code !== 200 || !checkout) {
    var failed = readBookings_().filter(function (b) { return b.payRef === outcome.payRef; })[0];
    if (failed) updateRow_(failed.row, { status: 'init-failed', payment: 'Paystack did not start: ' + cleanLine_(res.body && res.body.message, 120) });
    return { ok: false, code: 'gateway', message: 'The payment page could not be opened. Please try again.' };
  }
  return { ok: true, url: checkout };
}

function payVerify_(data) {
  var result = settlePayment_(cleanLine_(data.payRef, 40));
  return { ok: true, state: result.state, info: result.info || null, emailed: Boolean(result.emailed) };
}

// Looks at one Paystack payment and, if the money has arrived, confirms the booking.
// States: confirmed, needs-new-time, pending, failed, problem, not_found, error.
function settlePayment_(payRef) {
  if (!/^RC-[A-Za-z0-9]+-\d+$/.test(payRef)) return { state: 'not_found' };
  var row = readBookings_().filter(function (b) { return b.payRef === payRef; })[0];
  if (!row) return { state: 'not_found' };
  if (row.status === 'confirmed') return { state: 'confirmed', info: infoFor_(row) };
  if (row.status === 'needs-new-time') return { state: 'needs-new-time', info: infoFor_(row) };
  if (row.status === 'payment-problem' || row.status === 'init-failed') return { state: 'problem' };
  if (!paystackKey_()) return { state: 'error' };

  var res = paystackCall_('get', '/transaction/verify/' + encodeURIComponent(payRef));
  var tx = res.body && res.body.data;
  if (res.code !== 200 || !tx) return { state: 'pending' };
  var status = String(tx.status);
  if (status === 'failed' || status === 'reversed') return { state: 'failed' };
  if (status !== 'success') return { state: 'pending' };

  // The money arrived. Make sure it is the right amount in the right currency.
  var rightAmount = Number(tx.amount) === row.total * 100 && (!tx.currency || String(tx.currency) === 'KES');
  if (!rightAmount) {
    updateRow_(row.row, { status: 'payment-problem', payment: 'Paystack amount or currency did not match. Check Paystack.' });
    safely_(function () {
      MailApp.sendEmail({
        to: CONFIG.COACH_EMAIL,
        name: CONFIG.BUSINESS_NAME + ' website',
        subject: 'ACTION NEEDED: payment problem for booking ' + row.ref,
        body: 'A Paystack payment (' + payRef + ') for ' + row.name + ' (' + row.email + ') did not match the expected amount of KSh ' +
          row.total + '. Please check it in your Paystack dashboard.',
      });
    });
    return { state: 'problem' };
  }

  var channel = tx.channel === 'mobile_money' ? 'M-Pesa' : tx.channel === 'card' ? 'card' : 'Paystack';
  var paymentText = 'Paid online by ' + channel + ' (Paystack)';
  var receipt = cleanLine_(tx.receipt_number || tx.id || payRef, 40);

  var outcome = withLock_(function () {
    var fresh = readBookings_().filter(function (b) { return b.payRef === payRef; })[0];
    if (fresh.status === 'confirmed' || fresh.status === 'needs-new-time') return { already: fresh.status };
    var free = isFree_(fresh.start, fresh.end, Date.now(), fresh.ref);
    var next = free ? 'confirmed' : 'needs-new-time';
    updateRow_(fresh.row, { status: next, payment: paymentText, receipt: receipt, holdUntil: '' });
    return { status: next };
  });
  if (outcome.already) {
    return { state: outcome.already === 'confirmed' ? 'confirmed' : 'needs-new-time', info: infoFor_(row) };
  }

  var booking = bookingFromRow_(row, paymentText, receipt);
  if (outcome.status === 'needs-new-time') {
    safely_(function () { sendCoachEmail_(booking, true); });
    return { state: 'needs-new-time', info: infoFor_(row) };
  }
  safely_(function () { sendCoachEmail_(booking, false); });
  var emailed = safely_(function () { sendClientEmail_(booking); });
  return { state: 'confirmed', info: infoFor_(row), emailed: emailed };
}

// Runs every few minutes (see enableAutoChecks). Confirms clients who paid but closed the page.
function reconcilePayments() {
  if (!paystackKey_()) return;
  var nowMs = Date.now();
  readBookings_().forEach(function (b) {
    var waiting = b.payRef && (b.status === 'awaiting-payment' || b.status === 'released');
    if (!waiting || nowMs - b.holdUntil > 6 * HOUR_MS) {
      if (waiting) updateRow_(b.row, { status: 'unpaid' });
      return;
    }
    settlePayment_(b.payRef);
  });
}
