import { Mail } from 'lucide-react';
import { NAV, SITE } from '../../config/site';
import Logo from '../art/Logo';
import Container from '../ui/Container';

export default function Footer() {
  return (
    <footer className="on-dark bg-fig-950 text-fig-200">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-5 max-w-sm font-display text-2xl leading-snug text-mist-100">
            {SITE.tagline}
          </p>
          <p className="mt-4 max-w-sm text-[0.95rem] text-fig-300">
            Compassionate, whole-person coaching with {SITE.coach}, {SITE.credential}.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-sans text-sm font-semibold text-mist-100">On this page</h2>
          <ul className="mt-4 space-y-2.5">
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-[0.95rem] text-fig-200 hover:text-sun-300">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-sans text-sm font-semibold text-mist-100">Get in touch</h2>
          <a
            href={`mailto:${SITE.email}`}
            className="mt-4 inline-flex items-center gap-2.5 text-[0.95rem] text-fig-200 hover:text-sun-300"
          >
            <Mail size={18} aria-hidden="true" />
            {SITE.email}
          </a>
          <p className="mt-4 text-[0.95rem] text-fig-300">
            Sessions and times are in East Africa Time.
          </p>
        </div>
      </Container>

      <div className="border-t border-fig-800">
        <Container className="flex flex-col gap-3 py-6 pb-24 text-sm text-fig-300 md:flex-row md:items-center md:justify-between md:pb-6">
          <p>
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
