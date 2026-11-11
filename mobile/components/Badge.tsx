/**
 * Status badges per `docs/design-system.md` §6.4.
 *
 * Specs: 4px radius, 3px 8px padding, 11px Inter 600. Colour never carries the
 * meaning alone — every badge renders its label text (§11).
 */

import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme';

export type BadgeVariant =
  | 'green'
  | 'gold'
  | 'blue'
  | 'violet'
  | 'amber'
  | 'red'
  | 'gray';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const SURFACE: Record<BadgeVariant, { background: string; text: string }> = {
  green: { background: colors.mist, text: '#065f46' },
  gold: { background: colors.goldLight, text: colors.goldDeep },
  blue: { background: colors.skyLight, text: '#0369a1' },
  violet: { background: colors.violetLight, text: '#6d28d9' },
  amber: { background: colors.amberLight, text: '#92400e' },
  red: { background: colors.dangerLight, text: '#991b1b' },
  gray: { background: colors.bgGray, text: colors.textSecondary },
};

export function Badge({ label, variant = 'green' }: BadgeProps) {
  const { background, text } = SURFACE[variant];
  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.sm,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
});
