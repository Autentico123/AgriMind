/**
 * Design-system components for the farmer app.
 *
 * Every component mirrors `docs/design-system.md` §6 and the approved
 * `prototype/`. Import from this barrel rather than reaching into files.
 */

export { Badge, type BadgeProps, type BadgeVariant } from './Badge';
export { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from './Button';
export {
  Card,
  CardBody,
  CardLabel,
  CardTitle,
  type CardProps,
  type CardVariant,
} from './Card';
export {
  EmptyState,
  ErrorState,
  LoadingState,
  OfflineBanner,
  Skeleton,
  type EmptyStateProps,
  type ErrorStateProps,
} from './ScreenState';
export { StatRow, StatTile, type StatTileProps, type StatTileVariant } from './StatTile';
export { TextField, type TextFieldProps } from './TextField';
export { Icon, iconNames, type IconName, type IconProps } from './Icon';
