export function formatKes(amount) {
  if (!amount) return 'Free';
  return `KSh ${Number(amount).toLocaleString('en-KE')}`;
}

// PayPal does not support Kenyan Shillings, so it is charged in US dollars.
// Rounding up means the amount received never falls short of the KSh price.
export function kesToUsd(kes, kesPerUsd) {
  return Math.ceil((kes / kesPerUsd) * 100) / 100;
}

export const formatUsd = (amount) => `US$${amount.toFixed(2)}`;

export const firstName = (full = '') => full.trim().split(/\s+/)[0] || '';
