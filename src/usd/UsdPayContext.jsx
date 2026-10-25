import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const UsdPayContext = createContext(null);

// Opens and closes the "Pay in USD" window from anywhere on the site.
export function UsdPayProvider({ children }) {
  const [open, setOpen] = useState(false);
  const openUsdPay = useCallback(() => setOpen(true), []);
  const closeUsdPay = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, openUsdPay, closeUsdPay }), [open, openUsdPay, closeUsdPay]);
  return <UsdPayContext.Provider value={value}>{children}</UsdPayContext.Provider>;
}

export function useUsdPay() {
  const value = useContext(UsdPayContext);
  if (!value) throw new Error('useUsdPay must be used inside <UsdPayProvider>.');
  return value;
}
