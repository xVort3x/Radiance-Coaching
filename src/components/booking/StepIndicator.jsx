import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cx } from '../../lib/cx';

export default function StepIndicator({ steps, current }) {
  const progress = steps.length > 1 ? current / (steps.length - 1) : 1;

  return (
    <div>
      <ol className="flex items-center justify-between gap-2" aria-label="Booking progress">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li
              key={step.id}
              aria-current={active ? 'step' : undefined}
              className={cx(
                'flex items-center gap-2 text-sm',
                active ? 'font-medium text-fig-900' : done ? 'text-moss-700' : 'text-fig-500',
              )}
            >
              <span
                className={cx(
                  'flex h-7 w-7 items-center justify-center rounded-full border text-xs transition-colors duration-300',
                  done && 'border-moss-700 bg-action text-white',
                  active && 'border-moss-700 bg-surface text-moss-800',
                  !done && !active && 'border-fig-200 bg-transparent',
                )}
              >
                {done ? <Check size={14} aria-hidden="true" /> : index + 1}
              </span>
              <span className={cx(!active && 'hidden sm:inline')}>{step.label}</span>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-moss-100" aria-hidden="true">
        <motion.div
          className="h-full rounded-full bg-action"
          initial={false}
          animate={{ width: `${Math.max(progress, 0.04) * 100}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
