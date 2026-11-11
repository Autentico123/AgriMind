/**
 * Card per `docs/design-system.md` §6.2.
 *
 * Flat surface: white background, mist border, no shadow.
 */

import type { ReactNode } from 'react';

export interface CardProps {
  label?: string;
  title?: string;
  children?: ReactNode;
}

export function Card({ label, title, children }: CardProps) {
  return (
    <section className="card">
      {label ? <p className="card__label">{label}</p> : null}
      {title ? <h3 style={{ marginTop: 'var(--space-1)' }}>{title}</h3> : null}
      {children ? (
        <div style={{ marginTop: 'var(--space-2)', fontSize: 13, color: 'var(--color-text-muted)' }}>
          {children}
        </div>
      ) : null}
    </section>
  );
}
