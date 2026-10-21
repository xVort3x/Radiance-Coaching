import { useState } from 'react';
import { CircleAlert, CircleCheck, LoaderCircle, Mail, Send } from 'lucide-react';
import { SITE } from '../../config/site';
import { isEmail } from '../../lib/validation';
import { submitContact } from '../../services/booking';
import Button from '../ui/Button';
import Container from '../ui/Container';
import { WhatsAppLink } from '../ui/WhatsAppButton';

const EMPTY = { name: '', email: '', message: '', website: '' };

export default function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | failed

  const update = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!values.name.trim()) next.name = 'Please tell us your name.';
    if (!isEmail(values.email)) next.email = 'Please enter a valid email address.';
    if (values.message.trim().length < 5) next.message = 'Please write a short message.';
    setErrors(next);
    if (Object.keys(next).length > 0) {
      document.getElementById(`contact-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    setStatus('sending');
    try {
      await submitContact(values);
      setStatus('sent');
      setValues(EMPTY);
    } catch {
      setStatus('failed');
    }
  };

  const sent = status === 'sent';

  return (
    <section id="contact" className="py-24 sm:py-32">
      <Container className="grid gap-14 lg:grid-cols-[5fr_7fr] lg:gap-24">
        <div>
          <h2 className="text-4xl leading-[1.08] text-fig-900 sm:text-5xl">Not ready to book? Say hello.</h2>
          <p className="mt-6 max-w-md text-lg text-fig-700">
            Ask a question, share a little about what is happening, or just tell us you are thinking about
            it. There is no pressure to book.
          </p>
          <a
            href={`mailto:${SITE.email}`}
            className="mt-8 inline-flex items-center gap-3 text-lg text-moss-800 underline decoration-moss-300 decoration-2 underline-offset-4 hover:decoration-moss-700"
          >
            <Mail size={22} aria-hidden="true" />
            {SITE.email}
          </a>
          <WhatsAppLink className="mt-4 flex items-center gap-3 text-lg text-moss-800 underline decoration-moss-300 decoration-2 underline-offset-4 hover:decoration-moss-700" />
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="relative rounded-[2rem] border border-moss-200 bg-mist-50 p-6 sm:p-10"
          aria-label="Send a message"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="mb-2 block text-sm font-medium text-fig-800">
                Your name
              </label>
              <input
                id="contact-name"
                className="field"
                autoComplete="name"
                value={values.name}
                onChange={update('name')}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'contact-name-error' : undefined}
              />
              {errors.name && (
                <p id="contact-name-error" className="mt-2 text-sm text-[#b4452f]">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-2 block text-sm font-medium text-fig-800">
                Email address
              </label>
              <input
                id="contact-email"
                type="email"
                className="field"
                autoComplete="email"
                value={values.email}
                onChange={update('email')}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'contact-email-error' : undefined}
              />
              {errors.email && (
                <p id="contact-email-error" className="mt-2 text-sm text-[#b4452f]">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Hidden from people. Automated spam fills it in, and the booking helper then ignores the message. */}
          <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
            <label htmlFor="contact-website">Leave this empty</label>
            <input
              id="contact-website"
              tabIndex={-1}
              autoComplete="off"
              value={values.website}
              onChange={update('website')}
            />
          </div>

          <div className="mt-6">
            <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-fig-800">
              Your message
            </label>
            <textarea
              id="contact-message"
              rows={5}
              className="field resize-y"
              value={values.message}
              onChange={update('message')}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? 'contact-message-error' : undefined}
            />
            {errors.message && (
              <p id="contact-message-error" className="mt-2 text-sm text-[#b4452f]">
                {errors.message}
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button type="submit" size="lg" disabled={status === 'sending'}>
              {status === 'sending' ? (
                <LoaderCircle size={20} className="animate-spin" aria-hidden="true" />
              ) : (
                <Send size={19} aria-hidden="true" />
              )}
              Send message
            </Button>

            <div role="status" aria-live="polite" className="text-[0.95rem]">
              {sent && (
                <p className="flex items-start gap-2 text-moss-700">
                  <CircleCheck size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
                  Thank you. Your message has been sent to Anne, and she will reply by email.
                </p>
              )}
              {status === 'failed' && (
                <p className="flex items-start gap-2 text-[#b4452f]">
                  <CircleAlert size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>
                    The message did not send. Please email{' '}
                    <a className="underline" href={`mailto:${SITE.email}`}>
                      {SITE.email}
                    </a>{' '}
                    instead.
                  </span>
                </p>
              )}
            </div>
          </div>
        </form>
      </Container>
    </section>
  );
}
