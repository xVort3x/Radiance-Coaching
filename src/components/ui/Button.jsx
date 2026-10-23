import { cx } from '../../lib/cx';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-colors duration-200 select-none disabled:cursor-not-allowed disabled:opacity-50';

const variants = {
  primary: 'bg-action text-white hover:bg-action-hover active:bg-action-press',
  secondary: 'border border-moss-700/40 text-moss-800 hover:border-moss-700 hover:bg-moss-100',
  sun: 'bg-sun-400 text-ink hover:bg-sun-hover active:bg-sun-press',
  outlineLight: 'border border-white/35 text-white hover:bg-white/10',
  quiet: 'text-moss-800 hover:bg-moss-100',
};

const sizes = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-6 text-[0.95rem]',
  lg: 'h-14 px-8 text-base',
};

export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  const extra = Tag === 'button' && !props.type ? { type: 'button' } : {};
  return (
    <Tag className={cx(base, variants[variant], sizes[size], className)} {...extra} {...props}>
      {children}
    </Tag>
  );
}
