import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [state, setState] = useState({ open: false, offerId: 'discovery', bundle: false });

  // `bundle` opens the 5-session package for a paid service.
  const openBooking = useCallback((offerId = 'discovery', bundle = false) => {
    setState({ open: true, offerId, bundle });
  }, []);

  const closeBooking = useCallback(() => {
    setState((current) => ({ ...current, open: false }));
  }, []);

  const value = useMemo(
    () => ({ ...state, openBooking, closeBooking }),
    [state, openBooking, closeBooking],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const value = useContext(BookingContext);
  if (!value) throw new Error('useBooking must be used inside <BookingProvider>.');
  return value;
}
