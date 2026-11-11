/**
 * Badge per `docs/design-system.md` §6.4.
 *
 * Colour never carries meaning alone — the label text always states the status
 * (§11).
 */

import type { ReactNode } from 'react';

export type BadgeVariant =
  | 'green'
  | 'gold'
  | 'blue'
  | 'violet'
  | 'amber'
  | 'red'
  | 'gray';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

export function Badge({ variant = 'green', children }: BadgeProps) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}
