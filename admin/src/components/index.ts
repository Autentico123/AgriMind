/**
 * Design-system components for the admin dashboard.
 *
 * Mirrors `docs/design-system.md` §6. Import from this barrel rather than
 * reaching into individual files.
 */

export { Badge, type BadgeProps, type BadgeVariant } from './Badge';
export { Button, type ButtonProps, type ButtonVariant } from './Button';
export { Card, type CardProps } from './Card';
export {
  EmptyState,
  ErrorState,
  LoadingState,
  Skeleton,
} from './ScreenState';
export { StatTile, type StatTileProps } from './StatTile';
export { TextField, type TextFieldProps } from './TextField';
