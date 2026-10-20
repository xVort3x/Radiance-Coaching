import { CREDENTIALS } from '../../config/site';
import Container from '../ui/Container';

export default function Credentials() {
  return (
    <section aria-labelledby="credentials-title" className="bg-mist-200 py-20 sm:py-24">
      <Container>
        <h2 id="credentials-title" className="max-w-2xl text-3xl leading-[1.1] text-fig-900 sm:text-4xl">
          Trained and certified
        </h2>
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {CREDENTIALS.map((item) => (
            <li
              key={item.id}
              className="flex flex-col rounded-[2rem] border border-moss-200 bg-mist-50 p-8 sm:p-10"
            >
              <div className="flex h-40 items-center">
                <img
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                  className={item.imageClass}
                />
              </div>
              <h3 className="mt-8 text-2xl text-fig-900">{item.title}</h3>
              <p className="mt-1 text-[0.95rem] font-medium text-moss-700">{item.caption}</p>
              <p className="mt-4 max-w-md text-fig-700">{item.text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
