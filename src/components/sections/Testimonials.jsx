import { TESTIMONIALS } from '../../config/content';
import Container from '../ui/Container';

// Renders nothing until real, consented testimonials are added in
// src/config/content.js. No placeholder quotes are ever shown.
export default function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section aria-labelledby="kind-words" className="bg-mist-200 py-24 sm:py-32">
      <Container>
        <h2 id="kind-words" className="max-w-2xl text-4xl leading-[1.08] text-fig-900 sm:text-5xl">
          Kind words from clients
        </h2>
        <ul className="mt-12 grid gap-10 md:grid-cols-2">
          {TESTIMONIALS.map((item) => (
            <li key={item.name}>
              <figure>
                <blockquote className="font-display text-2xl leading-snug text-fig-900">
                  {item.quote}
                </blockquote>
                <figcaption className="mt-4 text-fig-600">
                  {item.name}
                  {item.context ? `, ${item.context}` : ''}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
