import { motion } from 'framer-motion';
import { CreditCard, DollarSign, Smartphone } from 'lucide-react';
import { PAYMENT_METHODS } from '../../../config/payments';
import { cx } from '../../../lib/cx';

const ICONS = { mpesa: Smartphone, card: CreditCard, usd: DollarSign };

const BADGES = {
  demo: 'Preview',
  manual: 'Manual',
  paystack: 'Secure checkout',
  unavailable: 'Not set up',
};

export default function MethodPicker({ value, onChange, modes }) {
  // M-Pesa and Card always show (greyed out if not set up). US dollars only shows when it is on.
  const methods = PAYMENT_METHODS.filter((method) => method.id !== 'usd' || modes.usd !== 'unavailable');
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium text-fig-800">Choose how to pay</legend>
      <div className={cx('grid gap-3', methods.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
        {methods.map((method) => {
          const Icon = ICONS[method.id];
          const mode = modes[method.id];
          const disabled = mode === 'unavailable';
          const selected = value === method.id;
          return (
            <label
              key={method.id}
              className={cx(
                'relative flex cursor-pointer items-center gap-3 rounded-2xl border bg-surface px-4 py-3.5 transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-moss-700 sm:flex-col sm:items-start sm:gap-2.5',
                selected ? 'border-moss-700' : 'border-moss-300 hover:border-moss-500',
                disabled && 'cursor-not-allowed opacity-55 hover:border-moss-300',
              )}
            >
              <input
                type="radio"
                name="payment-method"
                value={method.id}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(method.id)}
                className="sr-only"
              />
              {selected && (
                <motion.span
                  layoutId="method-ring"
                  className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-moss-700 bg-moss-100/50"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span
                className={cx(
                  'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-200',
                  selected ? 'bg-action text-white' : 'bg-moss-100 text-moss-700',
                )}
              >
                <Icon size={20} aria-hidden="true" />
              </span>
              <span className="relative">
                <span className="block font-medium text-fig-900">{method.name}</span>
                <span className="block text-sm text-fig-600">{method.hint}</span>
                {BADGES[mode] && (
                  <span className="mt-1.5 inline-block rounded-full bg-sun-100 px-2 py-0.5 text-xs font-medium text-fig-800">
                    {BADGES[mode]}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
