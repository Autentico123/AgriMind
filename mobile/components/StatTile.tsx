/**
 * Stat tiles per `docs/design-system.md` §6.3.
 *
 * Weather tiles: sky background, sky-mid border, uppercase sky label.
 * Crop tiles: dew background, mist border, leaf label.
 */

import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

export type StatTileVariant = 'weather' | 'crop';

export interface StatTileProps {
  value: string;
  label: string;
  variant?: StatTileVariant;
}

export function StatTile({ value, label, variant = 'crop' }: StatTileProps) {
  const isWeather = variant === 'weather';
  return (
    <View
      style={[styles.tile, isWeather ? styles.weatherTile : styles.cropTile]}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text style={styles.value}>{value}</Text>
      <Text
        style={[styles.label, { color: isWeather ? colors.sky : colors.leaf }]}
      >
        {label}
      </Text>
    </View>
  );
}

/** A row of stat tiles, evenly distributed. */
export function StatRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.space2 + 2,
  },
  tile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.stat,
    paddingVertical: spacing.space3,
    paddingHorizontal: spacing.space1,
    alignItems: 'center',
    gap: spacing.space1,
  },
  weatherTile: {
    backgroundColor: colors.skyLight,
    borderColor: colors.skyMid,
  },
  cropTile: {
    backgroundColor: colors.dew,
    borderColor: colors.mist,
  },
  value: {
    fontSize: typography.statSmall.fontSize,
    fontWeight: '700',
    color: colors.forestDeep,
    lineHeight: typography.statSmall.lineHeight,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
