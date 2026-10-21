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
};

var COL = {
  ref: 0, status: 1, created: 2, when: 3, service: 4, pkg: 5, total: 6, name: 7, email: 8,
  phone: 9, notes: 10, payment: 11, receipt: 12, start: 13, end: 14, holdUntil: 15, minutes: 16,
};
var BOOKING_HEADERS = [
  'Reference', 'Status', 'Booked on', 'Session (East Africa Time)', 'Service', 'Package', 'Total (KSh)',
  'Name', 'Email', 'Phone', 'Notes from client', 'Payment', 'Payment code',
  'Start (ms)', 'End (ms)', 'Hold until (ms)', 'Minutes',
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
  if (b.status === 'hold') return b.holdUntil > nowMs;
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
      return b.status === 'hold' && b.holdUntil > nowMs && b.ref !== ref;
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
