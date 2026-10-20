import { STEPS } from '../../config/content';
import { useBooking } from '../../booking/BookingContext';
import Button from '../ui/Button';
import Container from '../ui/Container';

export default function Process() {
  const { openBooking } = useBooking();

  return (
    <section id="how-it-works" className="bg-mist-200 py-24 sm:py-32">
      <Container className="grid gap-14 lg:grid-cols-[5fr_7fr] lg:gap-24">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="text-4xl leading-[1.08] text-fig-900 sm:text-5xl">How coaching works</h2>
          <p className="mt-6 max-w-md text-lg text-fig-700">
            Three simple steps, and the first one is free. You can stop or pause whenever you need to.
          </p>
          <Button className="mt-8" onClick={() => openBooking('discovery')}>
            Book a free discovery call
          </Button>
        </div>

        <ol className="relative space-y-12">
          <span
            className="absolute bottom-6 left-[1.4rem] top-6 w-px bg-moss-300"
            aria-hidden="true"
          />
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative flex gap-6">
              <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-moss-700 font-display text-xl text-white">
                {index + 1}
              </span>
              <div className="pt-1">
                <h3 className="text-2xl text-fig-900 sm:text-[1.7rem]">{step.title}</h3>
                <p className="mt-2 max-w-xl text-fig-700">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
