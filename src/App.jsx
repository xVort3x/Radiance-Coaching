import { BookingProvider } from './booking/BookingContext';
import BookingModal from './components/booking/BookingModal';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import StickyBook from './components/layout/StickyBook';
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

export default function App() {
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
      <BookingModal />
    </BookingProvider>
  );
}
