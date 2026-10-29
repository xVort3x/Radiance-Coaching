import { ShieldCheck } from 'lucide-react';
import { SERVICES } from '../../config/content';
import { SITE } from '../../config/site';
import Container from '../ui/Container';

function Portrait() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-gradient-to-b from-sun-100 via-petal-200 to-moss-200">
        {SITE.portraitUrl ? (
          <img
            src={SITE.portraitUrl}
            alt={`${SITE.coach}, founder of ${SITE.name}`}
            width="1000"
            height="1249"
            loading="lazy"
            className="h-full w-full object-cover object-[50%_20%]"
          />
        ) : (
          <>
            <svg viewBox="0 0 320 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <circle cx="160" cy="250" r="64" fill="#F1CB7E" opacity="0.9" />
              <circle cx="160" cy="250" r="104" fill="none" stroke="#E9B44C" strokeOpacity="0.4" />
              <circle cx="160" cy="250" r="148" fill="none" stroke="#E9B44C" strokeOpacity="0.25" />
              <path d="M0 330 C70 296 130 322 190 336 S290 326 320 308 V400 H0Z" fill="#8FAE9A" />
              <path d="M0 366 C80 340 150 364 220 372 S290 366 320 354 V400 H0Z" fill="#3B5C4E" />
            </svg>
            <span className="absolute inset-x-0 top-[34%] text-center font-display text-7xl font-light text-moss-800/70">
              AK
            </span>
          </>
        )}
      </div>
      <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-action px-5 py-2.5 text-sm font-medium text-white shadow-[0_12px_30px_-12px_rgba(42,34,51,0.55)]">
        <ShieldCheck size={17} className="text-sun-300" aria-hidden="true" />
        {SITE.credential}
      </div>
    </div>
  );
}

export default function About() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <Container className="grid items-center gap-16 lg:grid-cols-[5fr_7fr] lg:gap-24">
        <Portrait />

        <div>
          <h2 className="text-4xl leading-[1.08] text-fig-900 sm:text-5xl">Meet {SITE.coach}</h2>
          <div className="mt-7 max-w-xl space-y-5 text-lg text-fig-700">
            <p>
              {SITE.coach} is the founder of {SITE.name} and a {SITE.credential}. She works with people at
              the hardest and most tender edges of life: loss, broken trust, the end of life, and the big
              changes that leave you unsure who you are.
            </p>
            <p>
              Her coaching is whole-person and trauma-informed. She listens first, tells you the truth
              kindly, and trusts you to know what you need. Nothing is rushed, and you are never asked to
              be further along than you are.
            </p>

            <h3 className="pt-3 font-display text-2xl text-fig-900">What she offers</h3>
            <ul className="space-y-3 text-[1.05rem]">
              {SERVICES.map((service) => (
                <li key={service.id}>
                  <span className="font-medium text-fig-900">{service.title}.</span> {service.tagline}
                </li>
              ))}
            </ul>
            <p>
              Not sure which fits? Begin with the free 30-minute discovery call, where you can share what is
              going on and ask anything you like, with no pressure to continue.
            </p>

            <h3 className="pt-3 font-display text-2xl text-fig-900">How sessions work</h3>
            <p>
              Sessions are held online by video call, so you can join from somewhere private and comfortable.
              You choose the focus of each session, and you can pause or change direction at any point.
            </p>

            <h3 className="pt-3 font-display text-2xl text-fig-900">Training</h3>
            <p>
              Anne is an ICF {SITE.credentialLong} (PCC) and a Certified End of Life Coach.{' '}
              <a
                href="#credentials"
                className="text-moss-800 underline decoration-moss-300 decoration-2 underline-offset-4 hover:decoration-moss-700"
              >
                See her credentials
              </a>
              .
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
