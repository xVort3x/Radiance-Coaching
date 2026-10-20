import { PACKAGE } from '../config/site';

// What a booking costs. `bundle` means the 5-session package (paid services only).
export function quoteFor(offer, bundle = false) {
  const isPackage = Boolean(bundle) && offer.priceKes > 0;
  const count = isPackage ? PACKAGE.sessions : 1;
  const each = isPackage ? offer.priceKes - PACKAGE.discountPerSessionKes : offer.priceKes;
  return {
    isPackage,
    count,
    each,
    total: each * count,
    saving: isPackage ? PACKAGE.discountPerSessionKes * count : 0,
  };
}
