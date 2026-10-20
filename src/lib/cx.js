// Tiny class-name joiner: cx('a', cond && 'b') -> 'a b'
export const cx = (...parts) => parts.filter(Boolean).join(' ');
