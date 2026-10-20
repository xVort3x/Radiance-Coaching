// Business details and booking rules. Edit this file to change what the site says
// and when people can book. Everything else reads from here.

export const SITE = {
  name: 'Radiance Coaching',
  coach: 'Anne Kibet',
  coachFirstName: 'Anne',
  credential: 'PCC Certified Coach',
  credentialLong: 'Professional Certified Coach',
  email: 'info.radiancecoaching@gmail.com',
  tagline: 'Healing, wholeness and hope.',
  // Anne's photo lives in /public/anne.jpg. Replace the file to change it, or set
  // this to null to show an illustration instead.
  portraitUrl: `${import.meta.env.BASE_URL}anne.jpg`,
};

export const CREDENTIALS = [
  {
    id: 'pcc',
    title: 'Certified Life Coach',
    caption: 'ICF Professional Certified Coach (PCC)',
    text: 'Anne holds a recognised Life Coach certification, demonstrating she has met rigorous standards in training, supervised practice, and professional ethics.',
    image: `${import.meta.env.BASE_URL}badges/icf-pcc.png`,
    alt: 'ICF Professional Certified Coach (PCC) credential badge',
    imageClass: 'h-36 w-36 object-contain',
  },
  {
    id: 'ceolc',
    title: 'Grief and End-of-Life Coaching',
    caption: 'Certified End of Life Coach',
    text: 'Anne is certified in Grief and End of Life Coaching, equipping her to walk alongside clients through loss, bereavement, and life\'s most tender transitions.',
    image: `${import.meta.env.BASE_URL}badges/coaching-at-end-of-life.png`,
    alt: 'Coaching at End of Life, Certified End of Life Coach badge',
    imageClass: 'h-36 w-auto rounded-xl',
  },
];

export const TIME = {
  zone: 'Africa/Nairobi',
  offsetHours: 3, // East Africa Time has no daylight saving.
  label: 'East Africa Time (EAT)',
};

export const SESSION_FORMAT = 'Online by video call';

// The price of one coaching session. It is only shown once a visitor has chosen
// a service and reached checkout, never in the page content.
export const SESSION_PRICE_KES = 5000;

// The free discovery call is for people who are not sure what they need.
export const OFFERS = {
  discovery: {
    id: 'discovery',
    name: 'Free discovery call',
    shortName: 'Free discovery call',
    minutes: 30,
    priceKes: 0,
    summary: 'Not sure what you need? Start here.',
  },
  life: {
    id: 'life',
    name: 'Life Coaching',
    shortName: 'Life Coaching',
    minutes: 60,
    priceKes: SESSION_PRICE_KES,
    summary: 'One-to-one Life Coaching.',
  },
  grief: {
    id: 'grief',
    name: 'Grief and End-of-Life Coaching',
    shortName: 'Grief and End-of-Life Coaching',
    minutes: 60,
    priceKes: SESSION_PRICE_KES,
    summary: 'One-to-one Grief and End-of-Life Coaching.',
  },
  betrayal: {
    id: 'betrayal',
    name: 'Betrayal Trauma Coaching',
    shortName: 'Betrayal Trauma Coaching',
    minutes: 60,
    priceKes: SESSION_PRICE_KES,
    summary: 'One-to-one Betrayal Trauma Coaching.',
  },
};

// Booking five sessions together is discounted. The discount applies to each
// session. Like all prices, it is only shown at checkout.
export const PACKAGE = { sessions: 5, discountPerSessionKes: 250 };

// Opening hours in East Africa Time. 0 = Sunday ... 6 = Saturday, null = closed.
// Slots are offered back to back from opening time, and the last one must end by
// closing time. A 30-minute call therefore starts every 30 minutes, a 60-minute
// session every 60 minutes.
export const AVAILABILITY = {
  hours: {
    0: null,
    1: { open: '10:00', close: '19:00' },
    2: { open: '10:00', close: '19:00' },
    3: { open: '10:00', close: '19:00' },
    4: { open: '10:00', close: '19:00' },
    5: { open: '10:00', close: '19:00' },
    6: { open: '11:30', close: '18:00' },
  },
  minNoticeHours: 24,
  maxAdvanceDays: 60,
  // Days off, holidays or leave, as 'YYYY-MM-DD' (East Africa Time).
  blockedDates: [],
};

export const NAV = [
  { label: 'Book', href: '#book' },
  { label: 'Services', href: '#services' },
  { label: 'Approach', href: '#approach' },
  { label: 'About Anne', href: '#about' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];
