/**
 * Icon set for the admin dashboard.
 *
 * The prototype uses emoji as placeholders; the dashboard uses Lucide icons
 * (`docs/design-system.md` §7). Icons inherit `currentColor` so they pick up the
 * surrounding text colour.
 */

import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Bug,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CloudOff,
  CloudSun,
  Droplet,
  Eye,
  Globe,
  History,
  Home,
  Info,
  Leaf,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Sprout,
  Thermometer,
  Trash2,
  Tractor,
  Wheat,
  Wind,
  X,
  type LucideIcon,
} from 'lucide-react';

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
  | 'calendar'
  | 'back'
  | 'chevronLeft'
  | 'chevronRight'
  | 'chevronDown'
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

const ICONS: Record<IconName, LucideIcon> = {
  farm: Tractor,
  crop: Sprout,
  weather: CloudSun,
  ai: Sparkles,
  alert: Bell,
  record: ClipboardList,
  offline: CloudOff,
  history: History,
  irrigation: Droplet,
  fertilizer: Leaf,
  pest: Bug,
  risk: AlertTriangle,
  language: Globe,
  location: MapPin,
  temperature: Thermometer,
  wind: Wind,
  harvest: Wheat,
  planting: Sprout,
  calendar: Calendar,
  back: ArrowLeft,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  refresh: RefreshCw,
  search: Search,
  trash: Trash2,
  edit: Pencil,
  check: Check,
  close: X,
  eye: Eye,
  lock: Lock,
  mail: Mail,
  phone: Phone,
  home: Home,
  settings: Settings,
  logout: LogOut,
  warning: AlertTriangle,
  info: Info,
};

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  /** Accessible name. Omit for icons beside visible text. */
  label?: string;
  className?: string;
}

export function Icon({
  name,
  size = 18,
  color,
  label,
  className,
}: IconProps) {
  const Glyph = ICONS[name];
  return (
    <Glyph
      size={size}
      color={color}
      className={className}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      style={{ flexShrink: 0 }}
    />
  );
}

export const iconNames = Object.keys(ICONS) as IconName[];
