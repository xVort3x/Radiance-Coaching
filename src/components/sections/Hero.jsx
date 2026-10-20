import { motion } from 'framer-motion';
import { CalendarCheck } from 'lucide-react';
import { HERO } from '../../config/content';
import { SITE } from '../../config/site';
import { useBooking } from '../../booking/BookingContext';
import SunriseArt from '../art/SunriseArt';
import Button from '../ui/Button';
import Container from '../ui/Container';

const EASE = [0.22, 1, 0.36, 1];

export default function Hero() {
  const { openBooking } = useBooking();

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-gradient-to-b from-mist-100 from-45% to-sun-100"
    >
      {/* Landscape: bottom of the screen on phones, right side on large screens. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[52%] lg:inset-y-0 lg:left-[36%] lg:h-full lg:[mask-image:linear-gradient(to_right,transparent,black_34%)]">
        <SunriseArt className="h-full w-full" align="xMidYMax" />
      </div>

      <Container className="flex min-h-[100svh] flex-col justify-center pb-[calc(58vw+4rem)] pt-32 sm:pb-[calc(46vw+5rem)] lg:pb-44 lg:pt-28">
        <div className="max-w-xl lg:max-w-[34rem]">
          <h1 className="text-[clamp(3.6rem,10.5vw,7.6rem)] font-light leading-[0.92] text-fig-900">
            {HERO.lines.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
                <motion.span
                  className="block"
                  initial={{ y: '108%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.2 + i * 0.14 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 1.0 }}
          >
            <p className="mt-9 max-w-[34rem] text-lg leading-relaxed text-fig-700 sm:text-xl">
              {HERO.message}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => openBooking('discovery')}>
                <CalendarCheck size={20} aria-hidden="true" />
                Book a free discovery call
              </Button>
              <Button as="a" href="#how-it-works" size="lg" variant="secondary">
                See how coaching works
              </Button>
            </div>

            <div className="mt-8 flex items-center gap-3">
              {SITE.portraitUrl && (
                <img
                  src={SITE.portraitUrl}
                  alt=""
                  width="48"
                  height="48"
                  className="h-12 w-12 rounded-full object-cover object-[50%_18%] ring-2 ring-white"
                />
              )}
              <p className="text-[0.95rem] leading-snug text-fig-700">
                <span className="block font-medium text-fig-900">{SITE.coach}</span>
                {SITE.credential}
              </p>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
