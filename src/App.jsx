import { useEffect, useState } from 'react';
import { BookingProvider } from './booking/BookingContext';
import BookingModal from './components/booking/BookingModal';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import StickyBook from './components/layout/StickyBook';
import LegalPage from './components/legal/LegalPage';
import WhatsAppButton from './components/ui/WhatsAppButton';
import About from './components/sections/About';
import Approach from './components/sections/Approach';
import BookingPanel from './components/sections/BookingPanel';
import Contact from './components/sections/Contact';
import Credentials from './components/sections/Credentials';
import Faq from './components/sections/Faq';
import Hero from './components/sections/Hero';
import Process from './components/sections/Process';
import Services from './components/sections/Services';
import Testimonials from './components/sections/Testimonials';

// #/privacy and #/terms show the policy pages. Every other address shows the site.
const legalRoute = () => {
  const match = window.location.hash.match(/^#\/(privacy|terms)$/);
  return match ? match[1] : null;
};

function useLegalRoute() {
  const [route, setRoute] = useState(legalRoute);
  useEffect(() => {
    const onChange = () => setRoute(legalRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export default function App() {
  const legal = useLegalRoute();
  if (legal) return <LegalPage slug={legal} />;

  return (
    <BookingProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-moss-700 focus:px-5 focus:py-3 focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <BookingPanel />
        <Services />
        <Approach />
        <About />
        <Credentials />
        <Process />
        <Testimonials />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <StickyBook />
      <WhatsAppButton />
      <BookingModal />
    </BookingProvider>
  );
}
