import { SITE } from './site';

export const HERO = {
  lines: ['Healing,', 'wholeness', 'and hope.'],
  message:
    'Life can bring profound beauty and deep pain all at once. Radiance Coaching provides a calm, steady space to honor your feelings, regain your footing, and intentionally rebuild a life that feels whole.',
};

// The three services. `offerId` links each one to its booking option in site.js.
// `title` is the booking name (tiles, checkout). `heading` is the name shown on the Services section.
export const SERVICES = [
  {
    id: 'life',
    offerId: 'life',
    title: 'Life Coaching',
    heading: 'Life Coaching',
    tagline: 'Change, direction and clarity.',
    text: 'For seasons of transition, when roles, relationships, or beliefs shift, and you rediscover who you are. We will work together to gain clarity on what truly matters, build decision-making you can trust, and intentionally cultivate a life that feels authentically yours.',
  },
  {
    id: 'grief',
    offerId: 'grief',
    title: 'Grief and End-of-Life Coaching',
    heading: 'Grief & End-of-Life Support',
    tagline: 'Loss, and life\'s most tender transitions.',
    text: 'A gentle, non-judgmental space to grieve in your own way and at your own pace. Whether you are facing a profound loss, your own mortality, or walking beside someone you love, we’ll move through the difficult conversations, practical choices, and deeper questions with care.',
  },
  {
    id: 'betrayal',
    offerId: 'betrayal',
    title: 'Betrayal Trauma Coaching',
    heading: 'Betrayal Trauma Support',
    tagline: 'Steadiness after broken trust.',
    text: 'A trauma-sensitive space focused on your immediate safety, stabilization, and nervous system regulation after shattered trust. Together, we gently process the somatic shock, grieve your profound losses, and build a structured path toward healing—whether you choose to navigate this recovery individually or as a couple.',
  },
];

// The short list of paths in the "Meet your coach" section.
export const ABOUT_PATHS = [
  {
    id: 'life',
    title: 'Life Coaching',
    text: 'Navigation, clarity, and intentional alignment for seasons of personal change.',
  },
  {
    id: 'grief',
    title: 'Grief & End-of-Life Support',
    text: 'A compassionate anchor for loss and life’s most tender transitions.',
  },
  {
    id: 'betrayal',
    title: 'Betrayal Trauma Coaching',
    text: 'Emotional safety, stabilization, and structured recovery after broken trust.',
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
    title: 'Book Your Complimentary Call',
    text: 'Unsure which path fits your current needs? Simply select a time that suits your schedule. This free, 30-minute video call is a private space to discuss what you are navigating, ask questions, and explore the best supportive framework for you—with zero obligation.',
  },
  {
    title: 'Select Your Path',
    text: 'Choose between Life Coaching, Grief and End-of-Life Support, or Betrayal Trauma Coaching. Once you select a time, your professional investment will be clearly displayed at checkout before you complete your booking securely via M-Pesa or card.',
  },
  {
    title: 'Begin at Your Own Pace',
    text: 'Every session is entirely self-directed and shaped around you. You direct the focus and depth of our conversations, ensuring we move exclusively at the speed that feels safe for your nervous system and your life.',
  },
];

export const FAQ = [
  {
    q: 'What is a free discovery call?',
    a: 'Designed for when you are unsure of your next step. This complimentary, 30-minute session is a safe space to share your current situation and ask questions. Together, we will clarify which path aligns with your needs, or determine if coaching is the right fit for you at this time—with absolutely no pressure to continue.',
  },
  {
    q: 'Which service should I choose?',
    a: 'Choose the specialized modality that mirrors your current situation below. If your circumstances feel too complex to categorize right now, you are warmly invited to book a complimentary 30-minute consultation so we can map out a supportive starting point together.',
  },
  {
    q: 'Where do sessions take place?',
    a: 'Our private online video sessions allow you to join from somewhere private and comfortable. All calendar slots are displayed in East Africa Time (EAT), with your local time automatically reflected alongside them to ensure absolute scheduling clarity.',
  },
  {
    q: 'How do I pay?',
    a: 'Begin with a free discovery call. For standard sessions, choose your coaching modality and calendar slot to view transparent pricing at checkout. Book securely using M-Pesa or card, with convenient US dollar payment options available for our international clients.',
  },
  {
    q: 'Can I book several sessions at once?',
    a: 'Investing in your progress with a 5-session package? Select your preferred coaching service below, then choose the multi-session package to apply a preferred rate to every session. You will select the date and time for your initial session now, and we will arrange the remaining four sessions together during our first meeting. Your package investment will be fully displayed at checkout prior to secure payment.',
  },
  {
    q: 'Confidentiality Standards',
    a: 'We maintain absolute privacy across all coaching containers. In alignment with professional coaching ethics, information is never shared unless standard safety exceptions arise involving a serious risk of harm, or if legal disclosure becomes necessary.',
  },
  {
    q: 'What if I need to reschedule?',
    a: `Alternative scheduling is available. If our open slots do not align with your availability, please email ${SITE.email} within 24 hrs so we can coordinate a time that works for you.`,
  },
];

// Add real client testimonials here, with their permission. The section stays
// hidden while this list is empty.
// Example: { quote: '…', name: 'First name or initials', context: 'Optional detail' }
export const TESTIMONIALS = [];
