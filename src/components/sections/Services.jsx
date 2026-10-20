import { Anchor, CalendarCheck, Compass, Flower2 } from 'lucide-react';
import { SERVICES } from '../../config/content';
import { OFFERS, PACKAGE, SESSION_FORMAT } from '../../config/site';
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
            <h2 className="text-4xl leading-[1.08] text-fig-900 sm:text-5xl">How Anne can support you</h2>
            <p className="mt-6 max-w-md text-lg text-fig-700">
              Three kinds of coaching, each one-to-one and {SESSION_FORMAT.toLowerCase()}. Choose the one
              that fits, or start with a free discovery call if you are not sure.
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
                      <h3 className="text-2xl text-fig-900 sm:text-[1.7rem]">{service.title}</h3>
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

        <div className="on-dark relative isolate mt-16 overflow-hidden rounded-[2rem] bg-moss-700 p-8 text-white sm:p-12">
          <RingsArt
            className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 opacity-40 sm:h-[26rem] sm:w-[26rem]"
            stroke="#F1CB7E"
          />
          <h3 className="max-w-xl text-3xl leading-tight sm:text-4xl">
            Not sure what you need? Start with a free discovery call.
          </h3>
          <p className="mt-5 max-w-xl text-lg text-moss-100">
            It is {discovery.minutes} minutes, it is free, and there is nothing to prepare. Tell Anne what is
            going on, ask anything, and together you will work out what kind of support fits, or whether
            coaching is right for you at all.
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
