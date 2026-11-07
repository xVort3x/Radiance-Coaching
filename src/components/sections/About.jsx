import { ShieldCheck } from 'lucide-react';
import { ABOUT_PATHS } from '../../config/content';
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
          <h2 className="text-4xl leading-[1.08] text-fig-900 sm:text-5xl">Meet your coach</h2>
          <div className="mt-7 max-w-xl space-y-5 text-lg text-fig-700">
            <p>
              {SITE.coachFirstName} is the founder of {SITE.name} and an ICF {SITE.credentialLong}
              (PCC). She walks alongside individuals navigating life’s most profound and sensitive
              transitions: loss, shattered trust, end-of-life journeys, and the pivotal identity shifts that
              follow unexpected change.
            </p>
            <p>
              Her framework is deeply integrative and trauma-informed. She prioritizes compassionate
              listening, delivers supportive and honest guidance, and respects your inherent capacity to
              direct your own path. In her practice, nothing is rushed, and you are always met exactly where
              you are today.
            </p>

            <h3 className="pt-3 font-display text-2xl text-fig-900">Tailored Paths of Support</h3>
            <ul className="space-y-3 text-[1.05rem]">
              {ABOUT_PATHS.map((path) => (
                <li key={path.id}>
                  <span className="font-medium text-fig-900">{path.title}:</span> {path.text}
                </li>
              ))}
            </ul>
            <p>
              Unsure which path fits your current needs? Begin with a complimentary, 30-minute discovery call
              to share your story, ask questions, and explore options with zero obligation.
            </p>

            <h3 className="pt-3 font-display text-2xl text-fig-900">Your Session Structure</h3>
            <p>
              All sessions are conducted via secure online video calls, allowing you to join from the privacy
              and comfort of your own space. You retain absolute ownership of every session, with full
              autonomy to guide the focus, pause, or adjust directions whenever your nervous system needs to
              reset.
            </p>

            <h3 className="pt-3 font-display text-2xl text-fig-900">Credentials</h3>
            <p>
              Anne holds the distinguished Professional Certified Coach (PCC) credential from the
              International Coaching Federation (ICF) and is a certified End of Life Coach, APSATS Trained Partner Coach.{' '}
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
