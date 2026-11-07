import { Anchor, CalendarCheck, Compass, Flower2 } from 'lucide-react';
import { SERVICES } from '../../config/content';
import { OFFERS, PACKAGE } from '../../config/site';
import { useBooking } from '../../booking/BookingContext';
import { RingsArt } from '../art/SunriseArt';
import Button from '../ui/Button';
import Container from '../ui/Container';

const ICONS = { life: Compass, grief: Flower2, betrayal: Anchor };

export default function Services() {
  const { openBooking } = useBooking();
  const discovery = OFFERS.discovery;

  return (
    <section id="services" className="py-24 sm:py-32">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[5fr_7fr] lg:gap-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-4xl leading-[1.08] text-fig-900 sm:text-5xl">Tailored Support for Your Journey</h2>
            <p className="mt-6 max-w-md text-lg text-fig-700">
              I offer three distinct paths of private, online video coaching designed to meet you exactly
              where you are. Explore the options below to find the right fit, or start with a complimentary
              discovery call to discuss the best path forward.
            </p>
          </div>

          <ul className="border-t border-moss-200">
            {SERVICES.map((service) => {
              const Icon = ICONS[service.id];
              return (
                <li key={service.id} className="border-b border-moss-200 py-8 sm:px-4">
                  <div className="flex gap-5 sm:gap-7">
                    <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-moss-100 text-moss-700">
                      <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-2xl text-fig-900 sm:text-[1.7rem]">{service.heading}</h3>
                      <p className="mt-2 max-w-xl text-fig-700">{service.text}</p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          aria-label={`Book a ${service.title} session`}
                          onClick={() => openBooking(service.offerId)}
                        >
                          Book a session
                        </Button>
                        <Button
                          variant="quiet"
                          size="sm"
                          aria-label={`Book the ${PACKAGE.sessions}-session ${service.title} package`}
                          onClick={() => openBooking(service.offerId, true)}
                        >
                          {PACKAGE.sessions}-session package
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="on-dark relative isolate mt-16 overflow-hidden rounded-[2rem] bg-action p-8 text-white sm:p-12">
          <RingsArt
            className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 opacity-40 sm:h-[26rem] sm:w-[26rem]"
            stroke="#F1CB7E"
          />
          <h3 className="max-w-xl text-3xl leading-tight sm:text-4xl">
            Not sure which path fits? Start with a complimentary discovery call.
          </h3>
          <p className="mt-5 max-w-xl text-lg text-moss-100">
            This confidential, {discovery.minutes}-minute session requires no prior preparation. It is simply
            a safe space to share what you are experiencing, ask questions, and collaboratively determine
            the best supportive path for you—even if that means exploring resources outside of coaching.
          </p>
          <Button className="mt-8" size="lg" variant="sun" onClick={() => openBooking('discovery')}>
            <CalendarCheck size={20} aria-hidden="true" />
            Book a free discovery call
          </Button>
        </div>
      </Container>
    </section>
  );
}
