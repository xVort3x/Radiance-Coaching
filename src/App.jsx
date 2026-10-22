import { useEffect, useState } from 'react';
import { BookingProvider } from './booking/BookingContext';
import BookingModal from './components/booking/BookingModal';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import StickyBook from './components/layout/StickyBook';
import LegalPage from './components/legal/LegalPage';
import PaymentReturn from './components/payment/PaymentReturn';
import WhatsAppButton from './components/ui/WhatsAppButton';
import { isPayRef } from './services/paystack';
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

// Paystack sends clients back to the site with ?reference=RC-...; that shows the payment check.
const paymentReference = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const value = params.get('reference') || params.get('trxref');
    return isPayRef(value) ? value : null;
  } catch {
    return null;
  }
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
  const [payRef] = useState(paymentReference);
  if (payRef) return <PaymentReturn payRef={payRef} />;
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
