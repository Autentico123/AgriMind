/**
 * Loading, empty, and error states for admin pages.
 *
 * Copy follows `docs/design-system.md` §9. Errors never expose stack traces or
 * internal detail.
 */

import type { ReactNode } from 'react';

import { Button } from './Button';

/** Shimmering skeleton block — loading uses skeletons, not spinners (§9). */
export function Skeleton({
  height = 16,
  width = '100%',
}: {
  height?: number;
  width?: string;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        height,
        width,
        borderRadius: 'var(--radius-sm)',
        background: 'var(--color-dew)',
        animation: 'agrimind-pulse 1.4s ease-in-out infinite',
      }}
    />
  );
}

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" aria-label={label} style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <Skeleton height={20} width="60%" />
      <Skeleton height={14} width="40%" />
      <Skeleton height={72} />
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        padding: 'var(--space-8) var(--space-4)',
        textAlign: 'center',
        display: 'grid',
        gap: 'var(--space-2)',
        justifyItems: 'center',
      }}
    >
      <h3>{title}</h3>
      {message ? (
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{message}</p>
      ) : null}
      {action}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this right now. Please try again.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="alert alert--danger">
      <p className="alert__title">{title}</p>
      <p className="alert__message">{message}</p>
      {onRetry ? (
        <div style={{ marginTop: 'var(--space-2)' }}>
          <Button variant="secondary" size="small" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  );
}
