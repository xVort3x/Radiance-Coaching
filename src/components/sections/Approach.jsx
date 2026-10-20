import { HeartHandshake, Leaf, ShieldCheck } from 'lucide-react';
import { PRINCIPLES } from '../../config/content';
import { RingsArt } from '../art/SunriseArt';
import Container from '../ui/Container';

const ICONS = { safety: ShieldCheck, whole: Leaf, hope: HeartHandshake };

export default function Approach() {
  return (
    <section id="approach" className="on-dark relative overflow-hidden bg-fig-900 py-24 text-mist-100 sm:py-32">
      <RingsArt className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] opacity-60 sm:-right-24 sm:-top-24" />

      <Container className="relative">
        <div className="max-w-3xl">
          <h2 className="text-4xl leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
            Whole-person and trauma-informed, at your pace
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-fig-200">
            Pain does not arrive neatly, and healing does not follow a schedule. Our work together is steady,
            honest and kind, and it always starts with your sense of safety.
          </p>
        </div>

        <ul className="mt-16 grid gap-x-12 gap-y-12 md:grid-cols-3">
          {PRINCIPLES.map((item) => {
            const Icon = ICONS[item.id];
            return (
              <li key={item.id}>
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-sun-300/50 text-sun-300">
                  <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-2xl text-white">{item.title}</h3>
                <p className="mt-3 text-fig-200">{item.text}</p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
