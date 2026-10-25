import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarCheck, Menu, X } from 'lucide-react';
import { NAV } from '../../config/site';
import { usdPayAvailable } from '../../config/payments';
import { useUsdPay } from '../../usd/UsdPayContext';
import { useBooking } from '../../booking/BookingContext';
import Logo from '../art/Logo';
import Button from '../ui/Button';
import Container from '../ui/Container';
import ThemeToggle from '../ui/ThemeToggle';
import { cx } from '../../lib/cx';

export default function Header() {
  const { openBooking } = useBooking();
  const { openUsdPay } = useUsdPay();
  const showUsd = usdPayAvailable();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => event.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const payUsd = () => {
    setMenuOpen(false);
    openUsdPay();
  };

  const book = () => {
    setMenuOpen(false);
    openBooking('discovery');
  };

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300',
        scrolled || menuOpen
          ? 'bg-mist-100/90 shadow-[0_1px_0_rgba(47,74,63,0.12)] backdrop-blur-md'
          : 'bg-transparent',
      )}
    >
      <Container className="flex h-[4.5rem] items-center justify-between gap-6">
        <a href="#top" className="rounded-lg" aria-label="Radiance Coaching, back to the top">
          <Logo />
        </a>

        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[0.95rem] text-fig-700 transition-colors hover:text-moss-700"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Button size="sm" variant="sun" className="hidden sm:inline-flex" onClick={book}>
            <CalendarCheck size={17} aria-hidden="true" />
            Book now
          </Button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-fig-900 hover:bg-moss-100 lg:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden lg:hidden"
          >
            <Container className="flex flex-col pb-6 pt-1">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-moss-200 py-3.5 font-display text-2xl text-fig-900"
                >
                  {item.label}
                </a>
              ))}
              {showUsd && (
                <button
                  type="button"
                  onClick={payUsd}
                  className="border-b border-moss-200 py-3.5 text-left font-display text-2xl text-fig-900"
                >
                  Pay in USD
                </button>
              )}
              <Button className="mt-5 w-full" size="lg" variant="sun" onClick={book}>
                <CalendarCheck size={19} aria-hidden="true" />
                Book now
              </Button>
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
