export function formatKes(amount) {
  if (!amount) return 'Free';
  return `KSh ${Number(amount).toLocaleString('en-KE')}`;
}

// US dollars, always with cents: US$25.50
export const formatUsd = (amount) =>
  `US$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const firstName = (full = '') => full.trim().split(/\s+/)[0] || '';
