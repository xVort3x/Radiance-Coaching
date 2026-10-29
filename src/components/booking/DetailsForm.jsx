import { legalHref } from '../../config/site';

function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fig-800">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-sm text-fig-600">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-err-icon">
          {error}
        </p>
      )}
    </div>
  );
}

export default function DetailsForm({ values, errors, onChange, discovery }) {
  const set = (key) => (event) =>
    onChange(key, event.target.type === 'checkbox' ? event.target.checked : event.target.value);
  const invalid = (key) => ({
    'aria-invalid': Boolean(errors[key]),
    'aria-describedby': errors[key] ? `bk-${key}-error` : undefined,
  });

  return (
    <form noValidate onSubmit={(event) => event.preventDefault()} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="bk-name" label="Your name" error={errors.name}>
          <input
            id="bk-name"
            className="field"
            autoComplete="name"
            value={values.name}
            onChange={set('name')}
            {...invalid('name')}
          />
        </Field>
        <Field id="bk-email" label="Email address" error={errors.email} hint="Your confirmation goes here.">
          <input
            id="bk-email"
            type="email"
            className="field"
            autoComplete="email"
            value={values.email}
            onChange={set('email')}
            {...invalid('email')}
          />
        </Field>
      </div>

      <Field id="bk-phone" label="Phone or WhatsApp (optional)" error={errors.phone}>
        <input
          id="bk-phone"
          type="tel"
          className="field"
          autoComplete="tel"
          placeholder="0712 345 678"
          value={values.phone}
          onChange={set('phone')}
          {...invalid('phone')}
        />
      </Field>

      <Field
        id="bk-notes"
        label={discovery ? 'What is on your mind? (optional)' : 'Anything you would like Anne to know? (optional)'}
        hint="Share only what feels comfortable. You can say more on the call."
      >
        <textarea
          id="bk-notes"
          rows={3}
          maxLength={600}
          className="field resize-y"
          value={values.notes}
          onChange={set('notes')}
        />
      </Field>

      <p className="text-sm text-fig-600">
        By continuing you agree to our{' '}
        <a href={legalHref('terms')} target="_blank" rel="noopener noreferrer" className="underline">
          terms of service
        </a>{' '}
        and{' '}
        <a href={legalHref('privacy')} target="_blank" rel="noopener noreferrer" className="underline">
          privacy policy
        </a>
        . They open in a new tab.
      </p>
    </form>
  );
}
