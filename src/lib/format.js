export function formatKes(amount) {
  if (!amount) return 'Free';
  return `KSh ${Number(amount).toLocaleString('en-KE')}`;
}

export const firstName = (full = '') => full.trim().split(/\s+/)[0] || '';
