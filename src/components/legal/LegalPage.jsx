import { useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { LEGAL_PAGES, LEGAL_UPDATED } from '../../config/legal';
import { SITE, homeHref, legalHref } from '../../config/site';
import Logo from '../art/Logo';
import Container from '../ui/Container';
import ThemeToggle from '../ui/ThemeToggle';

// A simple page for the privacy policy and terms, reached from /privacy/ and /terms/.
export default function LegalPage({ slug }) {
  const page = LEGAL_PAGES[slug];
  const heading = useRef(null);

  useEffect(() => {
    const previous = document.title;
    document.title = `${page.title} | ${SITE.name}`;
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
    return () => {
      document.title = previous;
    };
  }, [page]);

  const other = slug === 'privacy' ? LEGAL_PAGES.terms : LEGAL_PAGES.privacy;

  return (
    <>
      <header className="border-b border-moss-200 bg-mist-100">
        <Container className="flex items-center justify-between py-4">
          <a href={homeHref} aria-label={`${SITE.name}, back to the home page`}>
            <Logo />
          </a>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a href={homeHref} className="inline-flex items-center gap-2 text-[0.95rem] text-moss-800 hover:text-moss-600">
              <ArrowLeft size={18} aria-hidden="true" /> Back to the website
            </a>
          </div>
        </Container>
      </header>

      <main id="main" className="py-16 sm:py-24">
        <Container className="max-w-3xl">
          <h1
            ref={heading}
            tabIndex={-1}
            className="text-4xl leading-[1.1] text-fig-900 outline-none sm:text-5xl"
          >
            {page.title}
          </h1>
          <p className="mt-3 text-sm text-fig-600">Last updated {LEGAL_UPDATED}</p>
          <p className="mt-8 text-lg text-fig-700">{page.intro}</p>

          <div className="mt-12 space-y-10">
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl text-fig-900">{section.heading}</h2>
                {section.paragraphs?.map((text) => (
                  <p key={text} className="mt-3 text-fig-700">
                    {text}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-fig-700 marker:text-moss-500">
                    {section.bullets.map((text) => (
                      <li key={text}>{text}</li>
                    ))}
                  </ul>
                )}
                {section.after?.map((text) => (
                  <p key={text} className="mt-3 text-fig-700">
                    {text}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <p className="mt-14 border-t border-moss-200 pt-6 text-fig-700">
            You may also want to read our <a className="underline" href={legalHref(other.slug)}>{other.title.toLowerCase()}</a>.
          </p>
        </Container>
      </main>

      <footer className="border-t border-moss-200 bg-mist-50">
        <Container className="flex flex-col gap-2 py-6 text-sm text-fig-600 sm:flex-row sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {SITE.name}
          </p>
          <p>
            <a className="underline" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
          </p>
        </Container>
      </footer>
    </>
  );
}
