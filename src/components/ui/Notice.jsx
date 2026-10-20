import { CircleAlert, FlaskConical, Info } from 'lucide-react';
import { cx } from '../../lib/cx';

const TONES = {
  info: { icon: Info, box: 'border-moss-200 bg-moss-100/60 text-fig-800', iconColor: 'text-moss-600' },
  demo: { icon: FlaskConical, box: 'border-sun-300 bg-sun-100 text-fig-900', iconColor: 'text-sun-700' },
  error: { icon: CircleAlert, box: 'border-[#e3b3a8] bg-[#fbeeea] text-[#7d2a18]', iconColor: 'text-[#b4452f]' },
};

export default function Notice({ tone = 'info', className, children, role }) {
  const { icon: Icon, box, iconColor } = TONES[tone];
  return (
    <div
      role={role ?? (tone === 'error' ? 'alert' : undefined)}
      className={cx('flex gap-3 rounded-2xl border px-4 py-3 text-[0.925rem] leading-snug', box, className)}
    >
      <Icon size={19} className={cx('mt-0.5 shrink-0', iconColor)} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
