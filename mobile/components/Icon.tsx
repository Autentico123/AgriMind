/**
 * Icon set for the farmer app.
 *
 * The approved prototype uses emoji as placeholders; the real app uses vector
 * icons from MaterialCommunityIcons so they scale, tint with the palette, and
 * render consistently across devices. The mapping below keeps the prototype's
 * intent (`docs/design-system.md` §7 Iconography).
 */

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { colors } from '../theme';

export type IconName =
  | 'farm'
  | 'crop'
  | 'weather'
  | 'ai'
  | 'alert'
  | 'record'
  | 'offline'
  | 'history'
  | 'irrigation'
  | 'fertilizer'
  | 'pest'
  | 'risk'
  | 'language'
  | 'location'
  | 'temperature'
  | 'wind'
  | 'harvest'
  | 'planting'
  | 'pruning'
  | 'note'
  | 'calendar'
  | 'profile'
  | 'back'
  | 'chevron'
  | 'refresh'
  | 'search'
  | 'trash'
  | 'edit'
  | 'check'
  | 'close'
  | 'eye'
  | 'lock'
  | 'mail'
  | 'phone'
  | 'home'
  | 'settings'
  | 'logout'
  | 'warning'
  | 'info';

type MdiName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const ICONS: Record<IconName, MdiName> = {
  farm: 'tractor',
  crop: 'sprout',
  weather: 'weather-partly-rainy',
  ai: 'robot-outline',
  alert: 'bell-outline',
  record: 'clipboard-text-outline',
  offline: 'cloud-off-outline',
  history: 'history',
  irrigation: 'water',
  fertilizer: 'leaf',
  pest: 'bug-outline',
  risk: 'alert-outline',
  language: 'web',
  location: 'map-marker-outline',
  temperature: 'thermometer',
  wind: 'weather-windy',
  harvest: 'grass',
  planting: 'seed-outline',
  pruning: 'content-cut',
  note: 'note-text-outline',
  calendar: 'calendar-month-outline',
  profile: 'account-circle-outline',
  back: 'chevron-left',
  chevron: 'chevron-right',
  refresh: 'refresh',
  search: 'magnify',
  trash: 'trash-can-outline',
  edit: 'pencil-outline',
  check: 'check',
  close: 'close',
  eye: 'eye-outline',
  lock: 'lock-outline',
  mail: 'email-outline',
  phone: 'cellphone',
  home: 'home-outline',
  settings: 'cog-outline',
  logout: 'logout',
  warning: 'alert',
  info: 'information-outline',
};

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  /** Screen-reader label. Omit for decorative icons beside visible text. */
  accessibilityLabel?: string;
}

export function Icon({
  name,
  size = 20,
  color = colors.forestDeep,
  accessibilityLabel,
}: IconProps) {
  return (
    <MaterialCommunityIcons
      name={ICONS[name]}
      size={size}
      color={color}
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={!accessibilityLabel}
      importantForAccessibility={
        accessibilityLabel ? 'yes' : 'no-hide-descendants'
      }
    />
  );
}

export const iconNames = Object.keys(ICONS) as IconName[];
