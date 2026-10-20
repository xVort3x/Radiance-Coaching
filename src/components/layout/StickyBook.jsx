import { useEffect, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { useBooking } from '../../booking/BookingContext';
import Button from '../ui/Button';

// On phones the header has no booking button, so a bar stays at the bottom of
// the screen once the visitor has scrolled past the top of the page.
export default function StickyBook() {
  const { open, openBooking } = useBooking();
  const [past, setPast] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > 500);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!past || open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-moss-200 bg-mist-100/95 p-3 backdrop-blur-md md:hidden">
      <Button className="w-full" size="lg" variant="sun" onClick={() => openBooking('discovery')}>
        <CalendarCheck size={20} aria-hidden="true" />
        Book now
      </Button>
    </div>
  );
}
