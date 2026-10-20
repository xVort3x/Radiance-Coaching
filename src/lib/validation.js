export const isEmail = (value = '') => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

// Accepts 07xx, 01xx, 2547xx, 2541xx and +254 forms. Returns 2547XXXXXXXX or null.
export function normalizeKenyanPhone(value = '') {
  const compact = value.replace(/[\s\-()]/g, '');
  const match = compact.match(/^(?:\+?254|0)([17]\d{8})$/);
  return match ? `254${match[1]}` : null;
}

export const isMpesaCode = (value = '') => /^[A-Z0-9]{10}$/.test(value.trim().toUpperCase());

export function luhnValid(number = '') {
  const digits = number.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = Number(digits[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

export function detectBrand(number = '') {
  const digits = number.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'Visa';
  if (/^(?:5[1-5]|2(?:22[1-9]|2[3-9]\d|[3-6]\d\d|7[01]\d|720))/.test(digits)) return 'Mastercard';
  return null;
}

export function formatCardNumber(value = '') {
  const digits = value.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

export function formatExpiry(value = '') {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function expiryValid(value = '', now = new Date()) {
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  // A card is valid through the last day of its expiry month.
  return new Date(year, month, 1).getTime() > now.getTime();
}
