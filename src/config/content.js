import { SESSION_FORMAT, SITE } from './site';

export const HERO = {
  lines: ['Healing,', 'wholeness', 'and hope.'],
  message:
    'Life can be beautiful and deeply painful, sometimes in the same week. Radiance Coaching is a calm, steady place to feel what you feel, find your footing, and move toward a life that feels whole again.',
};

// The three services. `offerId` links each one to its booking option in site.js.
export const SERVICES = [
  {
    id: 'life',
    offerId: 'life',
    title: 'Life Coaching',
    tagline: 'Change, direction and clarity.',
    text: 'For seasons of change, when roles, relationships or beliefs are shifting and you want to know who you are now. Get clear on what matters, make decisions you trust, and build a life that feels like yours.',
  },
  {
    id: 'grief',
    offerId: 'grief',
    title: 'Grief and End-of-Life Coaching',
    tagline: 'Loss, and life\'s most tender transitions.',
    text: 'Room to grieve in your own way and in your own time, and support if you are facing your own mortality or walking beside someone you love, including the conversations, decisions and meaning that come with it.',
  },
  {
    id: 'betrayal',
    offerId: 'betrayal',
    title: 'Betrayal Trauma Coaching',
    tagline: 'Steadiness after broken trust.',
    text: 'When trust is broken the ground moves. Find steadiness and clarity, and learn to trust your own judgement again, at a pace that keeps you safe.',
  },
];

export const PRINCIPLES = [
  {
    id: 'safety',
    title: 'You set the pace',
    text: 'You choose what we talk about, what we leave alone, and when to pause. Nothing is rushed, and you never have to retell more than feels right.',
  },
  {
    id: 'whole',
    title: 'The whole person',
    text: 'Your body, relationships, beliefs and sense of meaning are all part of the picture, not only your thoughts and goals.',
  },
  {
    id: 'hope',
    title: 'Hope with honesty',
    text: 'We do not hurry grief or pretend things are fine. We look for what is still alive in you and take small, real steps from there.',
  },
];

export const STEPS = [
  {
    title: 'Book a free discovery call',
    text: 'Not sure what you need? Choose a time that suits you. We talk about what you are carrying and what kind of support would help, with no pressure to continue.',
  },
  {
    title: 'Choose your service',
    text: 'Life Coaching, Grief and End-of-Life Coaching, or Betrayal Trauma Coaching. Pick a time, and you will see the price at checkout before you pay with M-Pesa or card.',
  },
  {
    title: 'Begin at your pace',
    text: 'Each session is shaped around you. You decide the focus, and we move at the speed that feels safe.',
  },
];

export const FAQ = [
  {
    q: 'What is the free discovery call?',
    a: 'It is for when you are not sure what you need. You share what is going on, ask anything you like, and Anne helps you work out which service fits, or whether coaching is right for you at the moment. It is free, lasts 30 minutes, and there is no pressure to continue.',
  },
  {
    q: 'Which service should I choose?',
    a: 'If you can name it, choose it: Life Coaching for change and direction, Grief and End-of-Life Coaching for loss and mortality, Betrayal Trauma Coaching for broken trust. If you cannot, book the free discovery call and we will work it out together.',
  },
  {
    q: 'Where do sessions take place?',
    a: `${SESSION_FORMAT}, so you can join from somewhere private and comfortable. Times on this site are shown in East Africa Time and your own local time is shown beside them when it differs.`,
  },
  {
    q: 'How do I pay?',
    a: 'The discovery call is free. For a coaching session, you choose your service and a time, and the price is shown at checkout before you pay. You can pay by M-Pesa, or by Visa or Mastercard.',
  },
  {
    q: 'Can I book several sessions at once?',
    a: 'Yes. Choose a service, then choose the 5-session package for a discounted rate on every session. You pick the time of your first session when you book, and Anne arranges the other four with you. The package amount is shown at checkout before you pay.',
  },
  {
    q: 'Is what I share kept confidential?',
    a: 'Yes. What you share is kept private. The usual exceptions apply where there is a risk of serious harm to you or someone else, or where the law requires disclosure.',
  },
  {
    q: 'What if I need to change my time?',
    a: `Email ${SITE.coachFirstName} as early as you can at ${SITE.email} and she will help you find another time.`,
  },
];

// Add real client testimonials here, with their permission. The section stays
// hidden while this list is empty.
// Example: { quote: '…', name: 'First name or initials', context: 'Optional detail' }
export const TESTIMONIALS = [];
