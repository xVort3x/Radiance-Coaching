import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { FAQ } from '../../config/content';
import { cx } from '../../lib/cx';
import Container from '../ui/Container';

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="bg-mist-200 py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[4fr_8fr] lg:gap-24">
        <h2 className="text-4xl leading-[1.08] text-fig-900 sm:text-5xl">Questions people ask</h2>

        <div className="border-t border-moss-300">
          {FAQ.map((item, index) => {
            const open = openIndex === index;
            return (
              <div key={item.q} className="border-b border-moss-300">
                <h3 className="font-sans text-base">
                  <button
                    type="button"
                    id={`faq-q-${index}`}
                    aria-expanded={open}
                    aria-controls={`faq-a-${index}`}
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left font-display text-xl text-fig-900 sm:text-2xl"
                  >
                    {item.q}
                    <ChevronDown
                      size={22}
                      aria-hidden="true"
                      className={cx(
                        'shrink-0 text-moss-600 transition-transform duration-300',
                        open && 'rotate-180',
                      )}
                    />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      id={`faq-a-${index}`}
                      role="region"
                      aria-labelledby={`faq-q-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-7 text-fig-700">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
