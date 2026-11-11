/**
 * Button per `docs/design-system.md` §6.1.
 *
 * Variants map to the documented set. Disabled state uses the documented 0.4
 * opacity; loading preserves the label and blocks interaction.
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant =
  | 'primary'
  | 'gold'
  | 'secondary'
  | 'danger';

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
  size?: 'standard' | 'small';
  block?: boolean;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'standard',
  block = false,
  loading = false,
  disabled = false,
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size === 'small' && 'btn--small',
    block && 'btn--block',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {children}
    </button>
  );
}
