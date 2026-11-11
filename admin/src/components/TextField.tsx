/**
 * Text input per `docs/design-system.md` §6.6.
 *
 * Error state shows the documented danger border plus a 12px message.
 */

import { useId, type InputHTMLAttributes } from 'react';

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextField({ label, error, hint, id, ...rest }: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const describedBy = error
    ? `${fieldId}-error`
    : hint
      ? `${fieldId}-hint`
      : undefined;

  return (
    <div className="field">
      <label className="field__label" htmlFor={fieldId}>
        {label}
      </label>
      <input
        id={fieldId}
        className={`field__input${error ? ' field__input--error' : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {error ? (
        <span id={`${fieldId}-error`} className="field__error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span id={`${fieldId}-hint`} style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
