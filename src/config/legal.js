// Privacy policy and terms. Plain-language drafts for a Kenyan coaching practice.
// They are a starting point, not legal advice. Anne should read both, change anything
// that does not match how she works, and ideally have a lawyer look them over.
// Where a number or rule is a choice (for example the 24 hours' notice), it is listed
// once in RULES so it can be changed in one place.

import { SITE } from './site';

export const LEGAL_UPDATED = '21 October 2026';

export const RULES = {
  rescheduleNoticeHours: 24,
};

export const PRIVACY = {
  slug: 'privacy',
  title: 'Privacy policy',
  intro: `${SITE.name} is run by ${SITE.coach}. This page explains what personal information we collect through this website, why, who sees it, and the choices you have. We follow the Kenya Data Protection Act, 2019.`,
  sections: [
    {
      heading: 'Who is responsible for your information',
      paragraphs: [
        `${SITE.coach}, trading as ${SITE.name}, decides how your information is used and is responsible for protecting it. You can contact ${SITE.coachFirstName} about anything on this page at ${SITE.email}.`,
      ],
    },
    {
      heading: 'What we collect',
      paragraphs: ['We collect only what we need to run your session and look after you:'],
      bullets: [
        'Your name, email address and, if you give it, your phone number.',
        'The time and type of session you book.',
        'Anything you choose to write in the notes box or in a message. This can be personal, so please share only what feels comfortable.',
        'Payment details we need to match a payment to a booking: for M-Pesa, the confirmation code and phone number; for PayPal, the transaction reference; for cards, a reference from the payment provider.',
        'Basic technical information your browser sends to any website, such as your device type and approximate location from your internet address.',
      ],
    },
    {
      heading: 'What we do not collect',
      paragraphs: [
        'We never see or store your card number, expiry date or security code. Card details are typed only on your payment provider\'s own secure page. We do not use advertising trackers and we do not sell or rent your information.',
      ],
    },
    {
      heading: 'Why we use your information',
      bullets: [
        'To book your session, hold your chosen time and send you a confirmation and video link.',
        'To confirm your payment and keep proper financial records.',
        'To reply when you write to us.',
        `To prepare for your session. What you share is used only for this purpose.`,
        'To meet legal and tax obligations.',
      ],
      paragraphs: [
        'We rely on your consent (when you book or write to us), on the need to carry out the session you asked for, and on our legal duties.',
      ],
    },
    {
      heading: 'Who we share it with',
      paragraphs: [
        'Your information is shared only with the services we use to run the practice, and only as far as they need it to do their job:',
      ],
      bullets: [
        'Google (Google Sheets, Gmail and Google Apps Script), which stores your booking and sends emails from our business account.',
        'GitHub, which hosts this website, and our domain provider.',
        'Safaricom (M-Pesa), NCBA Bank, PayPal and our card payment provider, when you pay.',
        'A form-to-email service, used to deliver messages and bookings when the main booking system cannot be reached.',
        'Authorities, if the law requires us to share information.',
      ],
    },
    {
      heading: 'Confidentiality of your sessions',
      paragraphs: [
        `What you share with ${SITE.coachFirstName} in sessions stays between you. The only exceptions are where the law requires disclosure, or where there is a serious risk of harm to you or to someone else.`,
      ],
    },
    {
      heading: 'Where your information is kept and for how long',
      paragraphs: [
        'Your booking records are kept in our private Google account, which may store data on servers outside Kenya. We choose providers that protect data with industry-standard security, and we limit who can open the records to those who need them.',
        'We keep booking and payment records for as long as the law requires for financial records and for as long as is needed to look after you as a client. After that we delete or anonymise them. If you ask us to delete your information sooner, we will, unless the law requires us to keep it.',
      ],
    },
    {
      heading: 'Your rights',
      paragraphs: ['Under the Data Protection Act you can ask us to:'],
      bullets: [
        'Tell you what information we hold about you and give you a copy.',
        'Correct anything that is wrong or out of date.',
        'Delete your information, or stop using it, where we do not need to keep it.',
        'Stop using your information for a purpose you object to, and withdraw consent you gave earlier.',
      ],
      after: [
        `Email ${SITE.email} and we will reply within a reasonable time. If you are not happy with our answer, you can complain to the Office of the Data Protection Commissioner of Kenya (odpc.go.ke).`,
      ],
    },
    {
      heading: 'Cookies',
      paragraphs: [
        'This website does not use advertising or tracking cookies. Your browser may keep small files needed to display the page.',
      ],
    },
    {
      heading: 'Changes to this policy',
      paragraphs: [
        `We may update this page from time to time. The date at the top shows when it last changed. Questions? Write to ${SITE.email}.`,
      ],
    },
  ],
};

export const TERMS = {
  slug: 'terms',
  title: 'Terms of service',
  intro: `These terms explain how booking and working with ${SITE.name} works. By booking a session you agree to them. If anything is unclear, ask ${SITE.coachFirstName} before you book.`,
  sections: [
    {
      heading: 'The service',
      paragraphs: [
        `${SITE.name} offers one-to-one coaching with ${SITE.coach}, ${SITE.credential}: Life Coaching, Grief and End-of-Life Coaching, and Betrayal Trauma Coaching, plus a free 30-minute discovery call. Sessions are held online by video. Times are in East Africa Time (EAT).`,
        'Coaching is a partnership in which you decide what to work on and what to do next. You stay responsible for your own choices and decisions.',
      ],
    },
    {
      heading: 'Booking',
      bullets: [
        'You choose a time from the calendar. A booking is made once you have completed the steps on the site and, for paid sessions, paid.',
        'A time is held for you for a short while (about 15 minutes) as you complete payment. If you do not finish in time, it becomes available to others.',
        `A confirmation with your video link is emailed to you. If you do not receive it within a few minutes, check your spam folder or write to ${SITE.email}.`,
        'You need a private place, a steady internet connection and a device with a camera and microphone.',
      ],
    },
    {
      heading: 'The free discovery call',
      paragraphs: [
        'The discovery call is a free 30-minute conversation to help you decide what kind of support fits. There is no obligation to book further sessions.',
      ],
    },
    {
      heading: 'Fees and payment',
      bullets: [
        'The fee for each session is shown when you reach checkout, in Kenyan Shillings (KSh). Payment is due when you book.',
        'You can pay by M-Pesa, PayPal or card (Visa or Mastercard). PayPal charges in US dollars at the rate shown at checkout, and your bank or PayPal may add its own fees.',
        'For M-Pesa Paybill payments, you must enter the exact business number and account number shown, and then the M-Pesa confirmation code, so we can match your payment.',
        'A five-session package is paid in full when you book. The first session is the time you choose. The other sessions are arranged between you and Anne by email.',
      ],
    },
    {
      heading: 'Changing or cancelling',
      bullets: [
        `You can move your session to another time, free of charge, if you tell us at least ${RULES.rescheduleNoticeHours} hours before it starts. Reply to your confirmation email or write to ${SITE.email}.`,
        `If you cancel or ask to move your session with less than ${RULES.rescheduleNoticeHours} hours' notice, or you do not attend, the session may be counted as used. ${SITE.coachFirstName} will use her judgement kindly, especially in difficult circumstances.`,
        `If ${SITE.coachFirstName} has to cancel, she will offer you a new time, or a refund of that session if you prefer.`,
        'Sessions that have already taken place are not refundable. If you are unhappy with a session, please tell Anne so she can put it right.',
      ],
    },
    {
      heading: 'Confidentiality',
      paragraphs: [
        `${SITE.coachFirstName} keeps what you share with her confidential, as set out in our Privacy policy. Please do not record, share or publish a session without everyone\'s agreement.`,
      ],
    },
    {
      heading: 'Respect',
      paragraphs: [
        'We expect sessions to be respectful on both sides. Anne may end a session, or decline to continue working together, if the conversation becomes abusive or unsafe.',
      ],
    },
    {
      heading: 'Limits of our responsibility',
      paragraphs: [
        `${SITE.name} does everything reasonably possible to give you a caring, professional service, but we cannot promise particular results. To the extent the law allows, we are not responsible for losses that come from decisions you make, or from things outside our control such as internet outages or problems with payment providers. Nothing here limits any right you have under Kenyan law.`,
      ],
    },
    {
      heading: 'This website',
      paragraphs: [
        `The words, photos and design on this site belong to ${SITE.name} or are used with permission. Please do not copy them without asking.`,
      ],
    },
    {
      heading: 'Governing law and changes',
      paragraphs: [
        'These terms are governed by the laws of Kenya. We may update them from time to time; the version on this page at the time you book applies to your booking.',
        `Questions? Write to ${SITE.email}.`,
      ],
    },
  ],
};

export const LEGAL_PAGES = { privacy: PRIVACY, terms: TERMS };
