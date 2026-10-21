import { MessageCircle } from 'lucide-react';
import { ENV } from '../../config/env';
import { SITE } from '../../config/site';
import { cx } from '../../lib/cx';

export const whatsappHref = (message) =>
  ENV.whatsapp ? `https://wa.me/${ENV.whatsapp}?text=${encodeURIComponent(message)}` : null;

const GREETING = `Hello ${SITE.coachFirstName}, I found you through the ${SITE.name} website and would like to ask about coaching.`;

// Inline link, used in the contact section and footer. Renders nothing until a
// WhatsApp number is set (VITE_WHATSAPP_NUMBER).
export function WhatsAppLink({ className, children = 'Chat on WhatsApp' }) {
  const href = whatsappHref(GREETING);
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      <MessageCircle size={20} aria-hidden="true" />
      {children}
      <span className="sr-only"> (opens WhatsApp in a new tab)</span>
    </a>
  );
}

// Floating button. Sits above the phone "Book now" bar.
export default function WhatsAppButton() {
  const href = whatsappHref(GREETING);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Anne on WhatsApp (opens in a new tab)"
      className={cx(
        'fixed bottom-20 right-4 z-30 flex items-center gap-2.5 rounded-full bg-[#0E7C66] px-4 py-3.5 text-[0.95rem] font-medium text-white',
        'shadow-[0_14px_30px_-10px_rgba(14,124,102,0.7)] transition-transform duration-200 hover:scale-105 hover:bg-[#0B6A57]',
        'md:bottom-6 md:right-6 md:px-5',
      )}
    >
      <MessageCircle size={22} aria-hidden="true" />
      <span className="hidden sm:inline">Chat on WhatsApp</span>
    </a>
  );
}
